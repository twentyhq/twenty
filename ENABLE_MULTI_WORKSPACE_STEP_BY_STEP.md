# Enable Multi-Workspace - Step-by-Step Guide

## Current Situation

You have:
- ✅ Backend running on `http://localhost:3000`
- ✅ Frontend running on `http://localhost:3001`
- ❌ Multi-workspace disabled (commented out in .env)
- ❌ Workspace switching doesn't work

## The Fix (5 Minutes)

### Step 1: Edit Your Backend .env File

**File**: `packages/twenty-server/.env`

**Find this line** (around line 27):
```bash
# IS_MULTIWORKSPACE_ENABLED=false
```

**Change it to** (uncomment and set to true):
```bash
IS_MULTIWORKSPACE_ENABLED=true
DEFAULT_SUBDOMAIN=app
```

**Your complete .env should look like this**:
```bash
NODE_ENV=development
PG_DATABASE_URL=postgres://postgres:postgres@localhost:5432/default
REDIS_URL=redis://localhost:6379
APP_SECRET=mk+mc0YBcVlj4HParyCmdA+2VP0q/7PRqupMAYCFhu0=
SIGN_IN_PREFILLED=true

FRONTEND_URL=http://localhost:3001

# ———————— Multi-Workspace Settings ————————
IS_MULTIWORKSPACE_ENABLED=true
DEFAULT_SUBDOMAIN=app

# ———————— Optional ————————
# PORT=3000
# ACCESS_TOKEN_EXPIRES_IN=30m
# ... rest of your commented settings ...
```

### Step 2: Revert Your Frontend Change (IMPORTANT)

**File**: `packages/twenty-front/src/modules/client-config/states/isMultiWorkspaceEnabledState.ts`

**Change this**:
```typescript
import { createState } from 'twenty-ui/utilities';
export const isMultiWorkspaceEnabledState = createState<boolean>({
  key: 'isMultiWorkspaceEnabled',
  defaultValue: true,  // ❌ You changed this to true
});
```

**Back to this**:
```typescript
import { createState } from 'twenty-ui/utilities';
export const isMultiWorkspaceEnabledState = createState<boolean>({
  key: 'isMultiWorkspaceEnabled',
  defaultValue: false,  // ✅ Change back to false
});
```

**Why?** The frontend should receive this value from the backend, not hardcode it.

### Step 3: Restart Backend

```bash
# Stop your backend server (Ctrl+C)

# Start it again
cd packages/twenty-server
yarn start

# Or if you're using nx:
yarn nx start twenty-server
```

**Look for this in the startup logs**:
```
IS_MULTIWORKSPACE_ENABLED: true
DEFAULT_SUBDOMAIN: app
```

### Step 4: Restart Frontend

```bash
# Stop your frontend (Ctrl+C)

# Clear cache and start
cd packages/twenty-front
rm -rf .next node_modules/.cache
yarn start

# Or if using nx:
yarn nx start twenty-front
```

### Step 5: Clear Browser Data

**Important!** Open your browser console (F12) and run:
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

Or just do a hard refresh: **Cmd+Shift+R** (Mac) or **Ctrl+Shift+R** (Windows)

## Verification

### Test 1: Check Backend Config

```bash
curl http://localhost:3000/client-config | jq '.isMultiWorkspaceEnabled'
```

**Expected output**: `true`

If you don't have `jq`, just run:
```bash
curl http://localhost:3000/client-config
```

Look for:
```json
{
  "isMultiWorkspaceEnabled": true,
  "defaultSubdomain": "app",
  "frontDomain": "localhost"
}
```

### Test 2: Check Frontend Received Config

Open browser console and run:
```javascript
// Check if frontend received the config
fetch('http://localhost:3000/client-config')
  .then(r => r.json())
  .then(config => console.log('Multi-workspace enabled:', config.isMultiWorkspaceEnabled));
```

**Expected**: `Multi-workspace enabled: true`

### Test 3: Test Workspace Switching

1. Login to `http://localhost:3001`
2. Click on workspace dropdown (workspace name in left navigation)
3. You should see your available workspaces
4. Click on a different workspace
5. **Expected**: Page should redirect/reload and you're now in the new workspace

## What This Does

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│ Backend .env                                                │
│ IS_MULTIWORKSPACE_ENABLED=true                             │
│ DEFAULT_SUBDOMAIN=app                                       │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Backend: ClientConfigService                                │
│ Reads env variables and exposes via /client-config         │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ API: GET http://localhost:3000/client-config               │
│ Returns: {                                                  │
│   isMultiWorkspaceEnabled: true,                           │
│   defaultSubdomain: "app",                                  │
│   frontDomain: "localhost"                                  │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Frontend: useClientConfig hook                              │
│ Fetches config and sets Recoil state                       │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Frontend: isMultiWorkspaceEnabledState = true              │
│ domainConfigurationState = {                                │
│   frontDomain: "localhost",                                 │
│   defaultSubdomain: "app"                                   │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Workspace Switching Works! ✅                               │
│ - redirectToWorkspaceDomain() executes                      │
│ - No early return                                           │
│ - User can switch between workspaces                        │
└─────────────────────────────────────────────────────────────┘
```

### Backend Configuration Explained

**`IS_MULTIWORKSPACE_ENABLED=true`**
- Enables multi-workspace features
- Backend will handle subdomain-based workspace routing
- Used in: `client-config.service.ts`, `domain-manager.service.ts`

**`DEFAULT_SUBDOMAIN=app`**
- Default subdomain when accessing root domain
- Example: `localhost` → redirects to `app.localhost` (if configured)
- Used for workspace URL generation

**`FRONTEND_URL=http://localhost:3001`**
- Base URL for frontend
- Backend extracts hostname: `localhost`
- This becomes `frontDomain` in client config

## Local Development vs Production

### Local Development (What you have)
```bash
FRONTEND_URL=http://localhost:3001
IS_MULTIWORKSPACE_ENABLED=true
DEFAULT_SUBDOMAIN=app
```

Result:
- Frontend runs on: `http://localhost:3001`
- All workspaces accessible from same URL
- Switching works via URL parameters or session

### Production with Subdomains (Advanced)
```bash
FRONTEND_URL=https://app.yourdomain.com
IS_MULTIWORKSPACE_ENABLED=true
DEFAULT_SUBDOMAIN=app
```

Requirements:
- DNS: Wildcard `*.yourdomain.com`
- SSL: Wildcard certificate
- Each workspace gets own subdomain: `workspace1.yourdomain.com`

**Note**: For local development, you DON'T need subdomain infrastructure. The workspace switching will work with the single localhost URL.

## Troubleshooting

### Problem: Still getting "frontDomain and defaultSubdomain are required"

**Solution 1**: Make sure backend restarted
```bash
# Kill all node processes
pkill -f node

# Start fresh
cd packages/twenty-server
yarn start
```

**Solution 2**: Check .env file location
```bash
# Should be here:
packages/twenty-server/.env

# NOT here:
.env (root)
packages/twenty-front/.env
```

**Solution 3**: Verify env is loaded
```bash
# Add temporary console.log in backend
# File: packages/twenty-server/src/engine/core-modules/client-config/services/client-config.service.ts
# Around line 103:

console.log('IS_MULTIWORKSPACE_ENABLED:', this.twentyConfigService.get('IS_MULTIWORKSPACE_ENABLED'));
console.log('DEFAULT_SUBDOMAIN:', this.twentyConfigService.get('DEFAULT_SUBDOMAIN'));
```

### Problem: Backend not reading .env changes

**Solution**: Use dotenv-cli
```bash
cd packages/twenty-server
npx dotenv -e .env -- yarn start
```

### Problem: Workspace switching still doesn't work

**Check 1**: Frontend received config?
```javascript
// Browser console
fetch('http://localhost:3000/client-config')
  .then(r => r.json())
  .then(c => console.table(c));
```

**Check 2**: Is redirect being called?
```javascript
// Temporarily add this to AvailableWorkspaceItem.tsx
const handleChange = async () => {
  console.log('Switching workspace to:', availableWorkspace.displayName);
  console.log('isMultiWorkspaceEnabled:', isMultiWorkspaceEnabled);

  await redirectToWorkspaceDomain(
    getWorkspaceUrl(availableWorkspace.workspaceUrls),
    pathname,
    searchParams,
  );
};
```

### Problem: "Cannot find module" errors after restart

**Solution**: Rebuild
```bash
# Clean install
yarn clean
yarn install
yarn build

# Start servers
yarn start:server  # Terminal 1
yarn start:front   # Terminal 2
```

## Summary

### What You Changed
1. ✅ Enabled `IS_MULTIWORKSPACE_ENABLED=true` in backend .env
2. ✅ Added `DEFAULT_SUBDOMAIN=app` in backend .env
3. ✅ Reverted frontend state to `defaultValue: false`
4. ✅ Restarted both servers
5. ✅ Cleared browser cache

### What Now Works
- ✅ Backend sends multi-workspace config to frontend
- ✅ Frontend receives `isMultiWorkspaceEnabled: true`
- ✅ Frontend receives `frontDomain: "localhost"`
- ✅ Frontend receives `defaultSubdomain: "app"`
- ✅ Workspace switching in dropdown works
- ✅ Users can switch between workspaces

### Next Steps
After this works:
1. Test creating new workspace (the other bug we found)
2. Test switching between multiple workspaces
3. Verify data isolation between workspaces
4. Consider implementing workspace creation fix next

## Quick Reference

**Enable multi-workspace**:
```bash
# In packages/twenty-server/.env
IS_MULTIWORKSPACE_ENABLED=true
DEFAULT_SUBDOMAIN=app
```

**Disable multi-workspace**:
```bash
# In packages/twenty-server/.env
IS_MULTIWORKSPACE_ENABLED=false
# DEFAULT_SUBDOMAIN=app  # Not needed when disabled
```

**Check if enabled**:
```bash
curl http://localhost:3000/client-config | grep -i multiworkspace
```

**Expected**: `"isMultiWorkspaceEnabled":true`

---

**Time to Complete**: 5 minutes
**Difficulty**: Easy (configuration only)
**Impact**: High (fixes workspace switching)

✅ After these changes, workspace switching should work!
