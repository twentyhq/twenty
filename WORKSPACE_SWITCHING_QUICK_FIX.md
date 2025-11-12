# Quick Fix: Workspace Switching Not Working

## Problem
Clicking on workspaces in the dropdown doesn't switch workspaces. Users stay on the current workspace with no error or feedback.

## Root Cause
The `isMultiWorkspaceEnabled` flag is `false`, causing the redirect function to exit early and do nothing.

**Location**: `packages/twenty-front/src/modules/domain-manager/hooks/useRedirectToWorkspaceDomain.ts:20`
```typescript
if (!isMultiWorkspaceEnabled) return; // ❌ Exits here, no redirect happens
```

---

## Quick Fix Option 1: Enable Multi-Workspace (RECOMMENDED)

### Backend Configuration

**Step 1**: Add environment variable

```bash
# .env file or environment variables
IS_MULTI_WORKSPACE_ENABLED=true

# Also ensure these are set:
FRONT_DOMAIN=yourdomain.com
DEFAULT_SUBDOMAIN=app
```

**Step 2**: Restart server
```bash
yarn start:server
```

**Step 3**: Test
1. Login with user having multiple workspaces
2. Open workspace dropdown
3. Click different workspace
4. Should redirect and switch workspaces ✅

### Requirements
- Subdomain infrastructure (e.g., `*.yourdomain.com`)
- DNS wildcard records configured
- Backend supports workspace-based routing

---

## Quick Fix Option 2: Remove Feature Check (FOR DEVELOPMENT ONLY)

⚠️ **WARNING**: Only use in development. May cause issues if backend doesn't support multi-workspace.

**File**: `packages/twenty-front/src/modules/domain-manager/hooks/useRedirectToWorkspaceDomain.ts`

**Change**:
```typescript
const redirectToWorkspaceDomain = async (
  baseUrl: string,
  pathname?: string,
  searchParams?: Record<string, string | boolean>,
  target?: string,
) => {
  // COMMENT OUT THIS LINE:
  // if (!isMultiWorkspaceEnabled) return;
  
  redirect(
    buildWorkspaceUrl(baseUrl, pathname, {
      ...searchParams,
      ...(await buildSearchParamsFromUrlSyncedStates()),
    }),
    target,
  );
};
```

**Test**:
```bash
yarn dev
```

---

## Quick Fix Option 3: Hide Dropdown When Disabled

**File**: `packages/twenty-front/src/modules/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/components/AvailableWorkspaceItem.tsx`

**Add check at top of component**:

```typescript
export const AvailableWorkspaceItem = ({
  availableWorkspace,
  isSelected,
}: {
  availableWorkspace: AvailableWorkspace;
  isSelected: boolean;
}) => {
  // ADD THIS:
  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);
  
  const { buildWorkspaceUrl } = useBuildWorkspaceUrl();
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();

  const { pathname, searchParams } =
    getAvailableWorkspacePathAndSearchParams(availableWorkspace);

  const handleChange = async () => {
    // ADD THIS CHECK:
    if (!isMultiWorkspaceEnabled) {
      console.warn('Multi-workspace switching is disabled');
      return;
    }
    
    await redirectToWorkspaceDomain(
      getWorkspaceUrl(availableWorkspace.workspaceUrls),
      pathname,
      searchParams,
    );
  };

  return (
    <UndecoratedLink
      key={availableWorkspace.id}
      to={buildWorkspaceUrl(
        getWorkspaceUrl(availableWorkspace.workspaceUrls),
        pathname,
        searchParams,
      )}
      onClick={(event) => {
        event.preventDefault();
        handleChange();
      }}
      // ADD THIS:
      style={{ opacity: !isMultiWorkspaceEnabled && !isSelected ? 0.5 : 1 }}
    >
      <MenuItemSelectAvatar
        text={availableWorkspace.displayName ?? '(No name)'}
        avatar={
          <Avatar
            placeholder={availableWorkspace.displayName || ''}
            avatarUrl={availableWorkspace.logo ?? DEFAULT_WORKSPACE_LOGO}
          />
        }
        selected={isSelected}
      />
    </UndecoratedLink>
  );
};
```

**Add import**:
```typescript
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useRecoilValue } from 'recoil';
```

---

## Verify the Fix

### Check Current State

**In browser console**:
```javascript
// Check if multi-workspace is enabled
console.log(window.__RECOIL_DEVTOOLS_GLOBAL__?.getNodes()?.find(n => n.key === 'isMultiWorkspaceEnabled')?.contents);
```

**Or add temporary debug**:
```typescript
// In AvailableWorkspaceItem.tsx
const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);
console.log('Multi-workspace enabled:', isMultiWorkspaceEnabled);
```

### Test Workspace Switching

1. Login with user having access to multiple workspaces
2. Open workspace dropdown
3. Click on different workspace
4. **Expected**: 
   - URL changes (e.g., `workspace1.app.com` → `workspace2.app.com`)
   - Page reloads
   - Now in different workspace
5. **Verify**:
   - Workspace name changes in dropdown
   - Workspace data is different
   - No console errors

---

## Debugging

### If switching still doesn't work:

**Check 1**: Is multi-workspace enabled?
```typescript
// Add to AvailableWorkspaceItem
console.log('isMultiWorkspaceEnabled:', isMultiWorkspaceEnabled);
```

**Check 2**: Is redirect being called?
```typescript
// Add to useRedirectToWorkspaceDomain
console.log('Redirecting to:', baseUrl, pathname, searchParams);
console.log('Built URL:', buildWorkspaceUrl(baseUrl, pathname, searchParams));
```

**Check 3**: Backend configuration
```bash
# Check environment variables
echo $IS_MULTI_WORKSPACE_ENABLED
echo $FRONT_DOMAIN
echo $DEFAULT_SUBDOMAIN
```

**Check 4**: Client config API response
```bash
curl http://localhost:3000/client-config | jq .isMultiWorkspaceEnabled
```

---

## Common Issues

### Issue 1: "isMultiWorkspaceEnabled is false"
**Solution**: Enable in backend (Option 1)

### Issue 2: Redirects but shows 404
**Solution**: Check subdomain DNS and backend routing

### Issue 3: Infinite redirect loop
**Solution**: Check authentication and workspace access permissions

### Issue 4: Works locally but not in production
**Solution**: Check production environment variables and DNS

---

## Rollback

If fix causes issues:

**Option 1 fix**: Set `IS_MULTI_WORKSPACE_ENABLED=false` and restart

**Option 2 fix**: 
```bash
git checkout packages/twenty-front/src/modules/domain-manager/hooks/useRedirectToWorkspaceDomain.ts
```

**Option 3 fix**:
```bash
git checkout packages/twenty-front/src/modules/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/components/AvailableWorkspaceItem.tsx
```

---

## Recommended Approach

1. **Try Option 1 first** (enable backend config) - Proper solution
2. **If infrastructure not ready**, use Option 3 (hide/disable UI) - Prevents confusion
3. **Only use Option 2 for local dev testing** - Not production-ready

---

## Time Estimates

- **Option 1**: 30 minutes (config + restart + test)
- **Option 2**: 5 minutes (code change + rebuild)
- **Option 3**: 15 minutes (code change + rebuild + test)

---

## Success Criteria

✅ User clicks workspace in dropdown
✅ Page redirects to selected workspace
✅ User can work in new workspace
✅ Can switch back to original workspace
✅ No console errors
✅ Smooth user experience

---

**Status**: Ready to implement
**Priority**: High
**Complexity**: Low (config) or Medium (code)