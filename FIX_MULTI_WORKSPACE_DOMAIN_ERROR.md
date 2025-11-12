# Fix: Multi-Workspace Domain Configuration Error

## Error You're Seeing

```
Error: frontDomain and defaultSubdomain are required
    at useIsCurrentLocationOnAWorkspace
```

## Why This Happens

You changed the **frontend** default value to `true`:
```typescript
// isMultiWorkspaceEnabledState.ts
defaultValue: true  // ❌ This alone doesn't work
```

But the **backend** is not configured for multi-workspace, so it doesn't send the required `frontDomain` and `defaultSubdomain` values.

## ✅ CORRECT FIX: Configure Backend

### Step 1: Revert Frontend Change (IMPORTANT)

**File**: `packages/twenty-front/src/modules/client-config/states/isMultiWorkspaceEnabledState.ts`

Change back to:
```typescript
import { createState } from 'twenty-ui/utilities';
export const isMultiWorkspaceEnabledState = createState<boolean>({
  key: 'isMultiWorkspaceEnabled',
  defaultValue: false,  // ✅ Change back to false
});
```

**Why**: The frontend should get this value from the backend, not hardcode it.

### Step 2: Create .env File for Backend

**File**: `packages/twenty-server/.env` (create if doesn't exist)

Add these lines:
```bash
# Multi-Workspace Configuration
IS_MULTIWORKSPACE_ENABLED=true
DEFAULT_SUBDOMAIN=app
FRONT_BASE_URL=http://localhost:3001

# If you're using a custom domain in production:
# FRONT_BASE_URL=https://app.yourdomain.com
```

**Note**: The backend reads `IS_MULTIWORKSPACE_ENABLED` (not `IS_MULTI_WORKSPACE_ENABLED`)

### Step 3: Restart Backend Server

```bash
# Stop server (Ctrl+C if running)

# Start server
yarn start:server

# Or if using nx:
yarn nx start twenty-server
```

### Step 4: Restart Frontend

```bash
# Stop frontend (Ctrl+C)

# Start frontend
yarn start:front

# Or:
yarn nx start twenty-front
```

---

## Verification

### Check 1: Backend Configuration Loaded

Look at server startup logs for:
```
IS_MULTIWORKSPACE_ENABLED: true
DEFAULT_SUBDOMAIN: app
```

### Check 2: Client Config API

```bash
curl http://localhost:3000/client-config | jq '.'
```

Should show:
```json
{
  "isMultiWorkspaceEnabled": true,
  "defaultSubdomain": "app",
  "frontDomain": "localhost"
}
```

### Check 3: Frontend State

Open browser console:
```javascript
// After app loads
console.log('Multi-workspace enabled:', 
  JSON.parse(localStorage.getItem('recoil-persist'))?.isMultiWorkspaceEnabled
);
```

Should show `true`.

### Check 4: Workspace Switching Works

1. Login with user having multiple workspaces
2. Open workspace dropdown
3. Click different workspace
4. **Expected**: Page redirects to new workspace
5. **Actual**: Should work now! ✅

---

## Alternative: Disable Multi-Workspace (If Infrastructure Not Ready)

If you don't have subdomain infrastructure set up, keep multi-workspace **disabled**:

**Backend .env**:
```bash
IS_MULTIWORKSPACE_ENABLED=false
```

**And implement UI fix** to hide non-functional workspace switching:

**File**: `packages/twenty-front/src/modules/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/components/AvailableWorkspaceItem.tsx`

Add at the top of the component:
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
  
  // Don't show other workspaces if feature is disabled
  if (!isMultiWorkspaceEnabled && !isSelected) {
    return null;
  }
  
  // Rest of component...
```

Add imports:
```typescript
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useRecoilValue } from 'recoil';
```

---

## Infrastructure Requirements for Multi-Workspace

If you want multi-workspace to work properly, you need:

### Local Development
```bash
# .env
IS_MULTIWORKSPACE_ENABLED=true
DEFAULT_SUBDOMAIN=app
FRONT_BASE_URL=http://localhost:3001
```

Works with: `http://localhost:3001`

### Production with Subdomains
```bash
# .env
IS_MULTIWORKSPACE_ENABLED=true
DEFAULT_SUBDOMAIN=app
FRONT_BASE_URL=https://app.yourdomain.com
```

Requires:
- ✅ DNS: Wildcard record `*.yourdomain.com`
- ✅ SSL: Wildcard certificate for `*.yourdomain.com`
- ✅ Backend: Subdomain routing configured

Enables: `workspace1.yourdomain.com`, `workspace2.yourdomain.com`, etc.

---

## Common Issues

### Issue 1: "Environment variable not found"
**Solution**: Make sure `.env` file is in `packages/twenty-server/` directory

### Issue 2: "Still getting domain error after restart"
**Solution**: 
- Clear browser cache
- Clear localStorage: `localStorage.clear()`
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

### Issue 3: "Backend not reading .env"
**Solution**: Check you're using the right .env file
```bash
# Should be here:
packages/twenty-server/.env

# NOT here:
.env
packages/twenty-front/.env
```

### Issue 4: "Works locally but not in production"
**Solution**: Set environment variables in your deployment platform (Vercel, Heroku, etc.)

---

## Quick Test

After configuration:

```bash
# Terminal 1 - Start backend
cd packages/twenty-server
yarn start

# Terminal 2 - Start frontend  
cd packages/twenty-front
yarn start

# Terminal 3 - Test config
curl http://localhost:3000/client-config | jq '.isMultiWorkspaceEnabled'
# Should output: true
```

Then open `http://localhost:3001` and test workspace switching.

---

## Summary

**DON'T**: Change frontend default value ❌
**DO**: Configure backend environment variables ✅

The frontend should **receive** the configuration from the backend, not hardcode it.

**Correct flow**:
```
Backend .env (IS_MULTIWORKSPACE_ENABLED=true)
  ↓
Backend ClientConfigService
  ↓
GET /client-config API
  ↓
Frontend useClientConfig hook
  ↓
isMultiWorkspaceEnabledState (set to true)
  ↓
Workspace switching works ✅
```

---

**Status**: Ready to implement
**Time**: 5-10 minutes
**Difficulty**: Easy (configuration only)