# CI Integration: Role Assignment Validation

This document explains how to integrate the role assignment validation check into your CI/CD pipeline to prevent the "No role found for userWorkspace" error.

## Quick Summary

**Problem**: Seeding scripts create `UserWorkspace` records without corresponding `roleTargets` entries, causing GraphQL query failures.

**Solution**: Add a CI check that validates all UserWorkspaces have role assignments before deploy.

## The CI Check

File: `ci-check-role-assignments.js`

This script:
- Queries the database for all UserWorkspace records
- Verifies each has at least one role assignment in `roleTargets`
- Exits with code 1 (fail) if any are missing
- Exits with code 0 (pass) if all are valid

## CI/CD Integration Examples

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: default
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'yarn'

      - name: Install dependencies
        run: yarn install --immutable

      - name: Build server
        run: yarn nx build twenty-server

      - name: Run database migrations
        run: yarn nx run twenty-server:database:migrate:prod
        env:
          PG_DATABASE_URL: postgres://postgres:postgres@localhost:5432/default

      - name: Seed database (if needed)
        run: yarn nx run twenty-server:command workspace:seed
        env:
          PG_DATABASE_URL: postgres://postgres:postgres@localhost:5432/default

      - name: Validate role assignments
        run: node ci-check-role-assignments.js
        env:
          POSTGRES_ADMIN_HOST: localhost
          POSTGRES_ADMIN_PORT: 5432
          POSTGRES_ADMIN_DATABASE: default
          POSTGRES_ADMIN_USER: postgres
          POSTGRES_ADMIN_PASSWORD: postgres
```

### GitLab CI

```yaml
# .gitlab-ci.yml
check-role-assignments:
  image: node:20
  services:
    - postgres:15
    - redis:7
  variables:
    POSTGRES_DB: default
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
    POSTGRES_HOST: postgres
    POSTGRES_PORT: 5432
    REDIS_URL: redis://redis:6379
  script:
    - yarn install --immutable
    - yarn nx build twenty-server
    - yarn nx run twenty-server:database:migrate:prod
    - yarn nx run twenty-server:command workspace:seed
    - node ci-check-role-assignments.js
  only:
    - merge_requests
    - main
```

### Local Development

Run the check manually before committing:

```bash
# Start your development environment
yarn start

# In another terminal, run the check
node ci-check-role-assignments.js
```

## What the Check Validates

1. **UserWorkspace ↔ RoleTargets Integrity**
   - Every UserWorkspace has at least one role assignment
   - Missing assignments cause GraphQL query failures (the bug you experienced)

2. **Workspace defaultRoleId**
   - All active workspaces must have `defaultRoleId` set
   - Required for assigning roles to new users

## Interpreting Results

### ✅ Success Output
```
🔍 Checking UserWorkspace role assignments...

✅ All UserWorkspace records have role assignments!

📊 Summary:
   Total UserWorkspaces checked: 1008
   All have proper role assignments

🔍 Checking workspaces for defaultRoleId...

✅ All active workspaces have defaultRoleId set

✅ CI check PASSED
```

### ❌ Failure Output
```
🔍 Checking UserWorkspace role assignments...

❌ Found 1 UserWorkspace(s) missing role assignments:

   Workspace: YCombinator (20202020-1c25-4d02-bf25-6aeccf7ea419)
   Missing roles for 1 user(s): tim@apple.dev

💡 To fix this issue:
   1. Check your seeding scripts for bugs
   2. Verify workspace.defaultRoleId is set
   3. Run the role assignment service after seeding
   4. Or manually insert missing roleTargets entries

❌ CI check FAILED
```

## Fix the Root Cause

The CI check prevents deployment but doesn't fix the underlying bug. Here's how to fix the seeding scripts:

### Option A: Modify Seeder (Recommended)

Edit `packages/twenty-server/src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util.ts`:

```typescript
export const seedUserWorkspaces = async (
  dataSource: DataSource,
  schemaName: string,
  workspaceId: string,
  defaultRoleId: string, // Add this parameter
) => {
  // ... existing code to create userWorkspaces array ...

  // Insert UserWorkspace records
  await dataSource.createQueryBuilder()
    .insert()
    .into(`${schemaName}.userWorkspace`, ['id', 'userId', 'workspaceId'])
    .orIgnore()
    .values(userWorkspaces)
    .execute();

  // NEW: Insert roleTargets for each UserWorkspace
  for (const uw of userWorkspaces) {
    await dataSource.createQueryBuilder()
      .insert()
      .into(`${schemaName}.roleTargets`, ['id', 'workspaceId', 'roleId', 'userWorkspaceId'])
      .orIgnore()
      .values({
        id: uuidv4(),
        workspaceId: workspaceId,
        roleId: defaultRoleId,
        userWorkspaceId: uw.id,
      })
      .execute();
  }
};
```

Then update the caller to pass `defaultRoleId`.

### Option B: Ensure Permissions Service Runs After Seeding

Make sure `dev-seeder-permissions.service.ts` is called **after** `seedUserWorkspaces` and assigns roles to all created UserWorkspaces.

## Adding a Database Safety Net

For production environments, add a database constraint:

```sql
-- Function to check if UserWorkspace has role assignment
CREATE OR REPLACE FUNCTION core.check_user_workspace_has_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."workspaceId" IN (
    SELECT id FROM core."workspace" WHERE "activationStatus" = 'ACTIVE'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM core."roleTargets" WHERE "userWorkspaceId" = NEW.id
    ) THEN
      RAISE EXCEPTION 'UserWorkspace % must have a role assignment in roleTargets', NEW.id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce the check
CREATE TRIGGER user_workspace_role_check
AFTER INSERT OR UPDATE ON core."userWorkspace"
FOR EACH ROW EXECUTE FUNCTION core.check_user_workspace_has_role();
```

**Warning**: Apply this carefully. It may break existing seeding scripts until they're fixed.

## Next Steps

1. ✅ CI validation script created
2. ⏳ Add script to your CI pipeline (GitHub Actions/GitLab CI)
3. ⏳ Fix seeding scripts (modify `seed-user-workspaces.util.ts`)
4. ⏳ Consider database constraint for production
5. ⏳ Write unit test: "After seeding, all UserWorkspaces must have roles"

By implementing these prevention layers, you'll catch this bug at multiple stages before it reaches production.