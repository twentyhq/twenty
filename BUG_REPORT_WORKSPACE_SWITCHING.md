# Bug Report: Workspace Switching Not Working in Dropdown

## Summary
Clicking on another workspace in the workspace dropdown does not switch workspaces. The dropdown displays available workspaces, but clicking them has no effect.

## Severity
**High** - Users with multiple workspaces cannot switch between them

## Affected Component
- Multi-Workspace Dropdown
- Workspace switching functionality

## User Impact
- Users cannot switch between their workspaces
- Multi-workspace functionality appears broken
- Users may think they only have access to one workspace

---

## Symptoms

### What Users See
1. User opens workspace dropdown in navigation drawer
2. User sees list of available workspaces
3. User clicks on a different workspace
4. **Nothing happens** - stays on current workspace
5. No error message, no loading indicator, no feedback

### What Users Expect
1. Click on workspace in dropdown
2. Page redirects to selected workspace
3. User is now working in the new workspace

---

## Root Cause Analysis

### Investigation Flow

**File**: `packages/twenty-front/src/modules/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/components/AvailableWorkspaceItem.tsx`

When a user clicks on a workspace, this component handles the click:

```typescript
const handleChange = async () => {
  await redirectToWorkspaceDomain(
    getWorkspaceUrl(availableWorkspace.workspaceUrls),
    pathname,
    searchParams,
  );
};
```

**File**: `packages/twenty-front/src/modules/domain-manager/hooks/useRedirectToWorkspaceDomain.ts`

The redirect function is called:

```typescript
export const useRedirectToWorkspaceDomain = () => {
  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);
  const { buildWorkspaceUrl } = useBuildWorkspaceUrl();
  const { redirect } = useRedirect();

  const { buildSearchParamsFromUrlSyncedStates } =
    useBuildSearchParamsFromUrlSyncedStates();

  const redirectToWorkspaceDomain = async (
    baseUrl: string,
    pathname?: string,
    searchParams?: Record<string, string | boolean>,
    target?: string,
  ) => {
    if (!isMultiWorkspaceEnabled) return; // ❌ EARLY RETURN - NOTHING HAPPENS!
    redirect(
      buildWorkspaceUrl(baseUrl, pathname, {
        ...searchParams,
        ...(await buildSearchParamsFromUrlSyncedStates()),
      }),
      target,
    );
  };

  return {
    redirectToWorkspaceDomain,
  };
};
```

**The Problem**: 
- Line 20: `if (!isMultiWorkspaceEnabled) return;`
- If `isMultiWorkspaceEnabled` is false, the function returns immediately
- The actual redirect never happens

**File**: `packages/twenty-front/src/modules/client-config/states/isMultiWorkspaceEnabledState.ts`

```typescript
export const isMultiWorkspaceEnabledState = createState<boolean>({
  key: 'isMultiWorkspaceEnabled',
  defaultValue: false, // ❌ DEFAULTS TO FALSE
});
```

**The State Value**:
- Defaults to `false`
- Set by backend client config
- Controlled by environment variable or server configuration

### Root Cause

**Multi-workspace functionality is disabled by default and/or not properly configured in the backend.**

When `isMultiWorkspaceEnabled` is `false`:
- Workspace dropdown still shows multiple workspaces
- Clicking workspaces does nothing (early return in redirect function)
- No error or warning is shown to user

This creates a confusing UX where the UI suggests multi-workspace support exists, but it's actually disabled.

---

## Technical Details

### Call Stack

```
User clicks workspace
  ↓
AvailableWorkspaceItem.handleChange()
  ↓
redirectToWorkspaceDomain(workspaceUrl, pathname, searchParams)
  ↓
Check: if (!isMultiWorkspaceEnabled) return; ← EXITS HERE
  ↓
[Never reached] redirect(url, target)
```

### State Management

**State**: `isMultiWorkspaceEnabledState`
- **Default Value**: `false`
- **Set By**: `useClientConfig` hook
- **Source**: Backend `/client-config` endpoint
- **Backend Variable**: Likely `IS_MULTI_WORKSPACE_ENABLED` or similar

### Configuration Chain

```
Backend Environment Variable
  ↓
Backend Client Config Service
  ↓
GET /client-config API endpoint
  ↓
Frontend useClientConfig hook
  ↓
isMultiWorkspaceEnabledState (Recoil)
  ↓
useRedirectToWorkspaceDomain hook
  ↓
Checks isMultiWorkspaceEnabled before redirect
```

---

## Why This Is Confusing

### Inconsistent Behavior

1. **UI Shows Workspaces** ✅
   - Dropdown displays all available workspaces
   - User can see they have access to multiple workspaces
   - UI suggests switching is possible

2. **Switching Doesn't Work** ❌
   - Clicking does nothing
   - No feedback to user
   - No error message

3. **Silent Failure** ❌
   - No console errors
   - No UI indication that feature is disabled
   - User thinks it's broken, not disabled

### Expected Behavior Options

**Option A**: If multi-workspace is disabled:
- Don't show workspace dropdown at all
- OR show current workspace only (no dropdown)
- OR disable workspace items with tooltip explaining why

**Option B**: If multi-workspace is enabled:
- Allow clicking to switch workspaces
- Show loading indicator during switch
- Redirect to selected workspace

**Current Behavior** (Broken):
- Shows workspaces but switching doesn't work
- No indication that feature is disabled
- Silent failure

---

## How to Reproduce

### Steps
1. Have user with access to multiple workspaces
2. Login to application
3. Open workspace dropdown (click workspace name/logo in left nav)
4. See list of available workspaces
5. Click on a different workspace
6. **Expected**: Redirect to clicked workspace
7. **Actual**: Nothing happens

### Environment
- Any environment where `IS_MULTI_WORKSPACE_ENABLED` is not configured or is `false`
- Likely affects local development environments
- May affect some production deployments

---

## Fix Options

### Option 1: Enable Multi-Workspace (Backend Configuration) ⭐ RECOMMENDED

**If multi-workspace should be enabled:**

**Backend** - Set environment variable:
```bash
IS_MULTI_WORKSPACE_ENABLED=true
```

or in configuration file:
```typescript
// packages/twenty-server/src/engine/core-modules/client-config/...
{
  isMultiWorkspaceEnabled: true
}
```

**Pros**:
- Simple configuration change
- No code changes needed
- Enables full multi-workspace functionality

**Cons**:
- Requires server restart
- May need infrastructure changes (subdomains, DNS, etc.)

---

### Option 2: Hide Dropdown When Disabled (Frontend Fix)

**If multi-workspace should stay disabled but UI should be consistent:**

**File**: `packages/twenty-front/src/modules/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/MultiWorkspaceDropdownButton.tsx`

```typescript
export const MultiWorkspaceDropdownButton = () => {
  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);
  const availableWorkspaces = useRecoilValue(availableWorkspacesState);
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  
  // NEW: Don't show dropdown if multi-workspace is disabled
  if (!isMultiWorkspaceEnabled) {
    return <CurrentWorkspaceDisplay workspace={currentWorkspace} />;
  }
  
  // Only show dropdown if multiple workspaces AND feature enabled
  if (availableWorkspaces.length <= 1) {
    return <CurrentWorkspaceDisplay workspace={currentWorkspace} />;
  }
  
  return <MultiWorkspaceDropdown />;
};
```

**Pros**:
- Prevents confusion
- UI matches functionality
- Clear to users

**Cons**:
- Users don't know multi-workspace exists
- May hide useful information (that they have access to other workspaces)

---

### Option 3: Show Disabled State with Tooltip

**If multi-workspace should stay disabled but users should know about it:**

**File**: `packages/twenty-front/src/modules/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/components/AvailableWorkspaceItem.tsx`

```typescript
export const AvailableWorkspaceItem = ({
  availableWorkspace,
  isSelected,
}: {
  availableWorkspace: AvailableWorkspace;
  isSelected: boolean;
}) => {
  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);
  const { buildWorkspaceUrl } = useBuildWorkspaceUrl();
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();

  const { pathname, searchParams } =
    getAvailableWorkspacePathAndSearchParams(availableWorkspace);

  const handleChange = async () => {
    if (!isMultiWorkspaceEnabled) {
      // Show tooltip or snackbar
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
    <Tooltip content={!isMultiWorkspaceEnabled ? "Workspace switching is disabled" : undefined}>
      <MenuItemSelectAvatar
        text={availableWorkspace.displayName ?? '(No name)'}
        avatar={<Avatar ... />}
        selected={isSelected}
        disabled={!isMultiWorkspaceEnabled && !isSelected}
        onClick={handleChange}
      />
    </Tooltip>
  );
};
```

**Pros**:
- Users see they have access to other workspaces
- Clear feedback why switching doesn't work
- Potential upgrade path messaging

**Cons**:
- More complex implementation
- May frustrate users who want the feature

---

### Option 4: Remove Feature Check (Allow Switching) ⚠️ RISKY

**If multi-workspace should always work regardless of config:**

**File**: `packages/twenty-front/src/modules/domain-manager/hooks/useRedirectToWorkspaceDomain.ts`

```typescript
export const useRedirectToWorkspaceDomain = () => {
  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);
  const { buildWorkspaceUrl } = useBuildWorkspaceUrl();
  const { redirect } = useRedirect();

  const { buildSearchParamsFromUrlSyncedStates } =
    useBuildSearchParamsFromUrlSyncedStates();

  const redirectToWorkspaceDomain = async (
    baseUrl: string,
    pathname?: string,
    searchParams?: Record<string, string | boolean>,
    target?: string,
  ) => {
    // REMOVED: if (!isMultiWorkspaceEnabled) return;
    // Always allow redirect if user has access to workspace
    
    redirect(
      buildWorkspaceUrl(baseUrl, pathname, {
        ...searchParams,
        ...(await buildSearchParamsFromUrlSyncedStates()),
      }),
      target,
    );
  };

  return {
    redirectToWorkspaceDomain,
  };
};
```

**Pros**:
- Workspace switching works immediately
- No backend config needed

**Cons**:
- May break if backend doesn't support multi-workspace
- Could cause issues with subdomains, routing, etc.
- Feature flag exists for a reason (infrastructure requirements)

---

## Recommendation

### Immediate Fix: Option 1 (Enable Multi-Workspace)

**Check backend configuration:**

```bash
# In .env or environment variables
IS_MULTI_WORKSPACE_ENABLED=true

# Also ensure these are configured:
FRONT_DOMAIN=your-domain.com
DEFAULT_SUBDOMAIN=app
```

**Required Infrastructure**:
- Wildcard subdomain support (`*.your-domain.com`)
- DNS configured for subdomains
- Backend routing supports workspace subdomains

### Long-term Fix: Consistent UX

Implement **Option 2** or **Option 3** to ensure UI matches functionality:

1. Hide workspace dropdown when multi-workspace is disabled
2. OR show disabled state with helpful message
3. OR provide clear upgrade/configuration path

---

## Testing Plan

### Test Case 1: Multi-Workspace Enabled
1. Set `IS_MULTI_WORKSPACE_ENABLED=true`
2. Restart backend
3. Login with user having multiple workspaces
4. Click workspace dropdown
5. Click different workspace
6. **Expected**: Redirects to new workspace
7. **Verify**: URL changes, workspace switches

### Test Case 2: Multi-Workspace Disabled
1. Set `IS_MULTI_WORKSPACE_ENABLED=false`
2. Restart backend
3. Login with user having multiple workspaces
4. **Expected**: Dropdown doesn't show OR shows disabled state
5. **Verify**: No false promise of functionality

### Test Case 3: Single Workspace
1. User has access to only one workspace
2. Login
3. **Expected**: No dropdown shown (or non-interactive)
4. **Verify**: Clean UI, no confusion

---

## Related Files

### Frontend
- `packages/twenty-front/src/modules/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/components/AvailableWorkspaceItem.tsx` - Workspace click handler
- `packages/twenty-front/src/modules/domain-manager/hooks/useRedirectToWorkspaceDomain.ts` - Redirect function with feature flag check
- `packages/twenty-front/src/modules/client-config/states/isMultiWorkspaceEnabledState.ts` - Feature flag state
- `packages/twenty-front/src/modules/client-config/hooks/useClientConfig.ts` - Sets feature flag from backend

### Backend
- Look for `IS_MULTI_WORKSPACE_ENABLED` environment variable
- Client config service that exposes this flag
- Domain management configuration

---

## Additional Notes

### Why Feature Flag Exists

Multi-workspace functionality requires:
1. **Subdomain infrastructure**: `workspace1.app.com`, `workspace2.app.com`
2. **DNS configuration**: Wildcard DNS records
3. **Backend routing**: Handle subdomain-based workspace resolution
4. **Authentication**: Cross-subdomain session management
5. **Database**: Workspace isolation and querying

The feature flag protects against enabling UI features when infrastructure isn't ready.

### Current State Analysis

**Issue**: Feature flag is working as designed (protecting infrastructure), but UI doesn't respect it.

**Result**: Users see non-functional UI, creating confusion.

**Solution**: Either enable the full feature, or hide/disable the UI when feature is off.

---

## Priority

**High** - This affects user experience for anyone with multiple workspaces. The feature appears broken rather than disabled.

## Estimated Fix Time

- **Option 1 (Enable)**: 1-2 hours (configuration + testing)
- **Option 2 (Hide UI)**: 2-3 hours (code changes + testing)
- **Option 3 (Disabled state)**: 3-4 hours (UI changes + testing)

---

**Status**: Identified - Awaiting Decision
**Next Steps**: 
1. Determine if multi-workspace should be enabled
2. If yes → Enable backend configuration
3. If no → Implement UI consistency fix (Option 2 or 3)