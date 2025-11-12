# Workspace Issues - Quick Reference Card

## 🔴 TWO CRITICAL ISSUES IDENTIFIED

---

## Issue #1: Workspace Creation Broken

**Symptom**: New workspaces stay in `PENDING_CREATION` state, users can't access them

**Quick Check**:
```sql
SELECT id, "displayName", "activationStatus" 
FROM core.workspace 
ORDER BY "createdAt" DESC LIMIT 5;
```
If you see `PENDING_CREATION` → **BROKEN**

**Fix** (2-4 hours):
1. Open: `packages/twenty-server/src/engine/core-modules/auth/services/sign-in-up.service.ts`
2. Add import: `import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';`
3. Inject in constructor: `private readonly workspaceService: WorkspaceService,`
4. In `signUpOnNewWorkspace()` method, after `userWorkspaceService.create()`, add:
```typescript
// Activate workspace immediately
try {
  workspace = await this.workspaceService.activateWorkspace(
    user,
    workspace,
    { displayName: `${user.firstName} ${user.lastName}'s Workspace` }
  );
} catch (error) {
  // Rollback
  await this.userWorkspaceService.deleteByWorkspaceId(workspace.id);
  await this.workspaceRepository.delete(workspace.id);
  throw new AuthException('Failed to activate workspace', ...);
}
```

**Test**: Create new workspace, check `activationStatus = 'ACTIVE'`

**Docs**: `WORKSPACE_CREATION_FIX_CODE_CHANGES.md`

---

## Issue #2: Workspace Switching Doesn't Work

**Symptom**: Clicking workspaces in dropdown does nothing

**Quick Check**:
```javascript
// Browser console
console.log(window.localStorage.getItem('isMultiWorkspaceEnabled'));
```
If `false` or `null` → **DISABLED**

**Quick Fix Option A - Enable Feature** (30 min) ⭐ RECOMMENDED:
```bash
# .env file
IS_MULTI_WORKSPACE_ENABLED=true
FRONT_DOMAIN=yourdomain.com
DEFAULT_SUBDOMAIN=app

# Restart server
yarn start:server
```

**Requirements**:
- ✅ DNS: Wildcard `*.yourdomain.com` configured
- ✅ SSL: Wildcard certificate
- ✅ Backend: Subdomain routing working

**Quick Fix Option B - Remove Check** (5 min, DEV ONLY):

File: `packages/twenty-front/src/modules/domain-manager/hooks/useRedirectToWorkspaceDomain.ts`

Comment out line 20:
```typescript
// if (!isMultiWorkspaceEnabled) return;
```

**Quick Fix Option C - Hide UI** (15 min):

File: `packages/twenty-front/src/modules/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/components/AvailableWorkspaceItem.tsx`

Add at top:
```typescript
const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);
if (!isMultiWorkspaceEnabled && !isSelected) return null;
```

**Test**: Click workspace in dropdown → should redirect to new workspace

**Docs**: `WORKSPACE_SWITCHING_QUICK_FIX.md`

---

## 🎯 Recommended Order

1. **First**: Fix workspace switching (30 min - enable backend config)
2. **Second**: Fix workspace creation (2-4 hours - code changes)
3. **Test both** together in staging
4. **Deploy** to production

---

## 🧪 Quick Verification

### Workspace Creation
```sql
-- Should be 0
SELECT COUNT(*) FROM core.workspace 
WHERE "activationStatus" = 'PENDING_CREATION';

-- Should match workspace count
SELECT COUNT(*) FROM metadata."workspaceMember";
```

### Workspace Switching
```bash
# Should return true
curl http://localhost:3000/client-config | jq .isMultiWorkspaceEnabled
```

---

## 📊 Success Criteria

✅ All new workspaces have `activationStatus = 'ACTIVE'`
✅ All workspaces have at least 1 workspace member
✅ GraphQL queries work on new workspaces
✅ Clicking workspace in dropdown switches workspace
✅ URL changes to new workspace subdomain
✅ No console errors

---

## 🚨 Rollback

### Issue #1 (Creation)
```bash
git revert <commit-hash>
```

### Issue #2 (Switching)
```bash
# Set in .env
IS_MULTI_WORKSPACE_ENABLED=false
# Restart server
```

---

## 📞 Need Help?

**Full Documentation**:
- Creation: `BUG_REPORT_WORKSPACE_CREATION.md`
- Switching: `BUG_REPORT_WORKSPACE_SWITCHING.md`
- Complete Summary: `WORKSPACE_ISSUES_SUMMARY.md`

**Key Files**:
- Creation: `packages/twenty-server/src/engine/core-modules/auth/services/sign-in-up.service.ts`
- Switching: `packages/twenty-front/src/modules/domain-manager/hooks/useRedirectToWorkspaceDomain.ts`

---

**Priority**: 🔴 CRITICAL
**Total Time**: 3-6 hours
**Risk**: LOW
**Impact**: HIGH - Fixes major UX issues