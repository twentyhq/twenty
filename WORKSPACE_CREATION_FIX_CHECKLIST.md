# Workspace Creation Fix - Implementation Checklist

## 📋 Pre-Implementation

- [ ] Read `BUG_REPORT_WORKSPACE_CREATION.md` for context
- [ ] Read `WORKSPACE_CREATION_FIX_CODE_CHANGES.md` for exact changes
- [ ] Create a new feature branch: `git checkout -b fix/workspace-creation-activation`
- [ ] Backup production database (if applicable)
- [ ] Ensure local development environment is running
- [ ] Run existing tests to confirm baseline: `yarn test`

---

## 🔧 Code Implementation

### Step 1: Add WorkspaceService Import

- [ ] Open `packages/twenty-server/src/engine/core-modules/auth/services/sign-in-up.service.ts`
- [ ] Locate imports section (around line 35)
- [ ] Add: `import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';`
- [ ] Save file

### Step 2: Inject WorkspaceService Dependency

- [ ] In same file, locate constructor (around line 45-60)
- [ ] Add to constructor parameters: `private readonly workspaceService: WorkspaceService,`
- [ ] Save file

### Step 3: Modify signUpOnNewWorkspace Method

- [ ] Locate `signUpOnNewWorkspace` method (around line 356-434)
- [ ] Change `const workspace` to `let workspace` (after workspace save)
- [ ] After `userWorkspaceService.create()` call, add workspace activation block:
  ```typescript
  // Activate workspace immediately
  try {
    const displayName = user.firstName
      ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}'s Workspace`
      : 'My Workspace';

    workspace = await this.workspaceService.activateWorkspace(
      user,
      workspace,
      { displayName },
    );
  } catch (error) {
    // Rollback: Clean up workspace if activation fails
    try {
      await this.userWorkspaceService.deleteByWorkspaceId(workspace.id);
    } catch {}
    
    try {
      await this.workspaceRepository.delete(workspace.id);
    } catch {}

    throw new AuthException(
      'Failed to activate workspace',
      AuthExceptionCode.INTERNAL_SERVER_ERROR,
      {
        userFriendlyMessage: t`Failed to create workspace. Please try again.`,
        originalError: error,
      },
    );
  }
  ```
- [ ] Comment out or remove `setOnboardingInviteTeamPending` call
- [ ] Save file

### Step 4: Add Cleanup Method (Optional)

- [ ] Open `packages/twenty-server/src/engine/core-modules/user-workspace/user-workspace.service.ts`
- [ ] Check if `deleteByWorkspaceId` method exists
- [ ] If not, add method:
  ```typescript
  async deleteByWorkspaceId(workspaceId: string): Promise<void> {
    await this.userWorkspaceRepository.delete({ workspaceId });
  }
  ```
- [ ] Save file

---

## ✅ Verification

### Code Verification

- [ ] Run TypeScript compiler: `yarn build`
- [ ] Fix any TypeScript errors
- [ ] Run linter: `yarn lint`
- [ ] Fix any lint errors
- [ ] Run existing tests: `yarn test`
- [ ] All tests pass

### Manual Testing (Local)

- [ ] Start development server: `yarn start:server`
- [ ] Server starts without errors
- [ ] Open GraphQL Playground
- [ ] Create test user (if needed):
  ```graphql
  mutation {
    signUp(
      email: "test@example.com"
      password: "TestPassword123!"
    ) {
      tokens {
        accessOrWorkspaceAgnosticToken {
          token
        }
      }
    }
  }
  ```
- [ ] Call `signUpInNewWorkspace`:
  ```graphql
  mutation {
    signUpInNewWorkspace {
      loginToken {
        token
      }
      workspace {
        id
        workspaceUrls {
          subdomainUrl
        }
      }
    }
  }
  ```
- [ ] Mutation succeeds without errors
- [ ] Returns workspace ID and login token

### Database Verification

- [ ] Connect to local database
- [ ] Check workspace status:
  ```sql
  SELECT id, "displayName", "activationStatus", subdomain
  FROM core.workspace
  ORDER BY "createdAt" DESC
  LIMIT 1;
  ```
- [ ] Verify `activationStatus` = `'ACTIVE'`
- [ ] Verify `displayName` is set (not empty)
- [ ] Check workspace member exists:
  ```sql
  SELECT wm.*, w."displayName" as workspace_name
  FROM metadata."workspaceMember" wm
  JOIN core.workspace w ON w.id::text = wm."workspaceId"
  ORDER BY w."createdAt" DESC
  LIMIT 1;
  ```
- [ ] Verify WorkspaceMember record exists
- [ ] Verify user details are correct

### GraphQL Query Test

- [ ] Use login token from mutation response
- [ ] Query currentUser on new workspace:
  ```graphql
  query {
    currentUser {
      id
      email
      workspaceMember {
        id
        name {
          firstName
          lastName
        }
      }
      currentWorkspace {
        id
        displayName
        activationStatus
      }
    }
  }
  ```
- [ ] Query succeeds
- [ ] Returns expected data
- [ ] No errors

---

## 🧪 Testing

### Unit Tests (Optional but Recommended)

- [ ] Create test file or update existing
- [ ] Test successful workspace creation
- [ ] Test workspace activation
- [ ] Test rollback on failure
- [ ] All tests pass: `yarn test`

### Integration Tests

- [ ] Test full signup flow
- [ ] Test existing user creating new workspace
- [ ] Test error handling
- [ ] Verify no regressions in existing tests

---

## 📝 Documentation

- [ ] Update CHANGELOG.md
- [ ] Add entry: "Fixed workspace creation - workspaces now activate immediately"
- [ ] Update any relevant API documentation
- [ ] Document the change in team wiki/Confluence

---

## 🚀 Deployment

### Pre-Deployment

- [ ] Code review completed and approved
- [ ] All tests passing on CI/CD
- [ ] Merge conflicts resolved
- [ ] Branch is up to date with main

### Staging Deployment

- [ ] Deploy to staging environment
- [ ] Verify staging server starts successfully
- [ ] Run smoke tests on staging
- [ ] Create test workspace on staging
- [ ] Verify workspace is ACTIVE
- [ ] Verify WorkspaceMember created
- [ ] Test GraphQL queries work
- [ ] No errors in staging logs

### Production Deployment

- [ ] Schedule deployment during low-traffic window
- [ ] Create database backup
- [ ] Deploy to production
- [ ] Monitor deployment logs
- [ ] Verify server health
- [ ] No errors during startup

---

## 📊 Post-Deployment Monitoring

### Immediate (First 30 Minutes)

- [ ] Check error logs for exceptions
- [ ] Monitor workspace creation rate
- [ ] Verify no spike in errors
- [ ] Check database for constraint violations:
  ```sql
  SELECT COUNT(*)
  FROM core.workspace
  WHERE "activationStatus" = 'PENDING_CREATION'
  AND "createdAt" > NOW() - INTERVAL '1 hour';
  ```
- [ ] Should be 0

### First Hour

- [ ] Create test workspace in production
- [ ] Verify workspace is ACTIVE
- [ ] Verify user can access workspace
- [ ] Check workspace status distribution:
  ```sql
  SELECT "activationStatus", COUNT(*)
  FROM core.workspace
  GROUP BY "activationStatus";
  ```
- [ ] All new workspaces should be ACTIVE

### First 24 Hours

- [ ] Monitor workspace creation metrics
- [ ] Check for any user reports of issues
- [ ] Verify workspace member creation rate matches workspace creation rate
- [ ] Review error logs daily
- [ ] Verify no rollback needed

---

## 🔄 Rollback Plan (If Needed)

### Rollback Triggers

- [ ] Workspace creation failure rate > 5%
- [ ] Database constraint violations
- [ ] Increase in GraphQL query errors
- [ ] User reports of inaccessible workspaces

### Rollback Steps

- [ ] Revert code changes: `git revert <commit-hash>`
- [ ] Deploy reverted version
- [ ] Clean up stuck workspaces (if any):
  ```sql
  DELETE FROM core."userWorkspace"
  WHERE "workspaceId" IN (
    SELECT id FROM core.workspace
    WHERE "activationStatus" != 'ACTIVE'
    AND "createdAt" > '[deployment-time]'
  );
  
  DELETE FROM core.workspace
  WHERE "activationStatus" != 'ACTIVE'
  AND "createdAt" > '[deployment-time]';
  ```
- [ ] Verify service health
- [ ] Investigate root cause

---

## 📈 Success Metrics

### Day 1

- [ ] 100% of new workspaces have ACTIVE status
- [ ] 0 workspaces in PENDING_CREATION state
- [ ] 0 workspace creation errors
- [ ] User signups continue normally

### Week 1

- [ ] No user complaints about workspace access
- [ ] Workspace creation rate stable or improved
- [ ] No increase in support tickets
- [ ] All metrics trending positively

---

## 🎉 Completion

- [ ] All checklist items completed
- [ ] Fix verified in production
- [ ] Metrics look good
- [ ] No rollback needed
- [ ] Team notified of successful deployment
- [ ] Close related tickets/issues
- [ ] Update project status

---

## 📞 Contacts

**If Issues Arise:**
- Engineering Lead: [Name]
- DevOps: [Name]
- Database Admin: [Name]

**Monitoring Dashboards:**
- [ ] Link to workspace creation metrics
- [ ] Link to error logs
- [ ] Link to database metrics

---

**Implementer**: _________________
**Date Started**: _________________
**Date Completed**: _________________
**Status**: ⬜ In Progress  ⬜ Complete  ⬜ Blocked