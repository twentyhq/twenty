# SDK Exports

Package: `twenty-sdk` v2.3.0. Binary: `twenty` → `dist/cli.cjs`.

## Public Subpaths

| Subpath | Purpose | Key Exports |
|---|---|---|
| `twenty-sdk/define` | Build-time app manifest factories | `defineApplication`, `defineObject`, `defineField`, `defineCommandMenuItem`, `defineFrontComponent`, `defineLogicFunction`, `definePostInstallLogicFunction`, `definePreInstallLogicFunction`, `defineConnectionProvider`, `defineNavigationMenuItem`, `definePageLayout`, `definePageLayoutTab`, `defineRole`, `defineSkill`, `defineView`, `defineAgent`, `getPublicAssetUrl` |
| `twenty-sdk/front-component` | Runtime React API for hosted UI | Context hooks (`useFrontComponentExecutionContext`, `useFrontComponentId`, `useRecordId`, `useSelectedRecordIds`, `useUserId`), host functions (`closeSidePanel`, `enqueueSnackbar`, `navigate`, `openCommandConfirmationModal`, `openSidePanelPage`, `unmountFrontComponent`, `updateProgress`), command components (`Command`, `CommandLink`, `CommandModal`, `CommandOpenSidePanelPage`), conditional availability variables |
| `twenty-sdk/logic-function` | Runtime helpers for function authors | `getConnection`, `listConnections`, `findConnectionForRequest`, `AppConnectionAuthFailedError`, `AppConnection`, `ListConnectionsFilter`, plus type-only payload contracts for route/cron/database-event/install |
| `twenty-sdk/billing` | Credit metering | `chargeCredits({ creditsUsedMicro, operationType, quantity, resourceContext? })` |
| `twenty-sdk/ui` | UI component exports | Re-exports from `twenty-ui` (dts-only in inspected scope) |
| `twenty-sdk/cli` | Programmatic auth/deploy operations | `authLogin`, `authLoginOAuth`, `authLogout`, `appBuild`, `appDeploy`, `appInstall`, `appPublish`, `appDevOnce`, `appUninstall`, `serverStart`, `serverUpgrade`, `functionExecute` |
| `twenty-sdk/front-component-renderer` | Remote-dom host rendering API | `FrontComponentRenderer`, host/remote component registries, `createRemoteWorker`, `installStyleBridge`, `exposeGlobals` |
| `twenty-sdk/front-component-renderer/build` | Build plugins for front components | `getFrontComponentBuildPlugins`, JSX transform wrappers, Preact alias, comment stripping |

**Evidence**: `packages/twenty-sdk/package.json` exports map; `packages/twenty-sdk/src/sdk/define/index.ts`; `packages/twenty-sdk/src/sdk/front-component/index.ts`; `packages/twenty-sdk/src/sdk/logic-function/index.ts`; `packages/twenty-sdk/src/sdk/billing/index.ts`.

## Define Primitives Detail

### defineApplication
Root manifest entry. Requires `universalIdentifier`, `defaultRoleUniversalIdentifier`, `displayName`. Returns validation result.

### defineObject / defineField
Custom objects and fields. Object requires universal identifier, singular/plural names, nested field validation. Field requires `objectUniversalIdentifier`. Supports composite fields, standard object references, `FieldType`, `RelationType`, `OnDeleteAction`.

### defineLogicFunction
Route, cron, or database-event trigger. Requires universal identifier + handler. Route: `path` + `httpMethod`. Cron: `pattern`. Database event: `eventName`. Also `definePreInstallLogicFunction` and `definePostInstallLogicFunction` for install hooks.

### defineConnectionProvider
OAuth provider metadata. UUID `universalIdentifier`, URL-safe `name`, `displayName`, `type` (currently `oauth` only), OAuth endpoints, client ID/secret variables, scopes.

### defineFrontComponent
UI extension component. Requires universal identifier + function component.

### defineRole
Access control. Role label + object/field/row-level permission references.

### defineView / definePageLayout / definePageLayoutTab
UI placement. View: object + field/filter/group/sort identifiers. Page layout: layout/tab/widget identifiers and titles.

### defineCommandMenuItem / defineNavigationMenuItem
Menu placement. Command menu: binds command to front component. Navigation: numeric position.

### defineSkill / defineAgent
AI extensibility. Skill: identifier/name/label/content. Agent: identifier/name/label/prompt.

## Runtime Helpers Detail

### Connection Helpers (logic-function)
- `listConnections(filter?)` → POST `/apps/connections/list` (filter: providerName, userWorkspaceId, visibility)
- `getConnection(id)` → POST `/apps/connections/get` (returns fresh token, throws on auth failure)
- `findConnectionForRequest(connections, { userWorkspaceId })` → prefers user credential, falls back to workspace

### Billing
- `chargeCredits(...)` → POST `/app/billing/charge` (5s timeout, non-fatal on failure, no-ops when env missing)

### Asset URLs
- `getPublicAssetUrl(path)` → resolves `public/...` file to `${apiUrl}/public-assets/${workspaceId}/${applicationId}/${path}`

### Front-Component Host Bridge
- Host populates `globalThis.frontComponentHostCommunicationApi`
- Components access via hooks and command wrappers
- Token refresh via `requestAccessTokenRefresh` on 401
