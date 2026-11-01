# POC: granted roles for confined apps

Proof of concept for the "requested role / granted role" design (core-team-issues#3139). A confined (marketplace) app keeps declaring a role with `defineApplicationRole()`, but that role is now only a request. At install the workspace builds a **grant**, a role owned by the workspace custom app, from the request plus the admin's choices. The app and its agents run with the grant alone.

Screenshots are in `poc-screenshots/`. Numbers `01` to `11` are referenced below.

## What works

Verified end to end on a fresh dev workspace (`tim@apple.dev`), mostly through the UI, with runtime checks through the example app's logic function.

- **Data model**
  - `roleTarget.targetApplicationId`, a fourth target kind. The check constraint allows exactly one of the user workspace, agent, API key, webhook or target application columns, and `(workspaceId, targetApplicationId)` is unique.
  - `role.canBeAssignedToApplications`.
  - `application.approvedRoleRequest` (jsonb): a snapshot of the last approved request.
  - All three come from one generated instance command (`2-55-instance-command-fast-1793433867335-add-application-granted-roles.ts`). The check constraint was edited by hand, as in the webhook precedent.
- **Validators**
  - A role must have `canBeAssignedToApplications` to get an application target.
  - Only the workspace custom app can create application targets, and only on roles it owns.
- **Single runtime resolver**: `getApplicationRuntimeRoleId()` (`application-grant/utils/get-application-runtime-role-id.util.ts`).
  - The flat application cache computes `runtimeRoleId` and `isGrantExempt` for each app. Confined apps get their grant; `twenty-standard` and the workspace custom app get their own role.
  - OAuth clients (OAuth-only registrations such as the Twenty CLI and dynamically registered MCP clients) are outside the request and grant model, as main already treats them as `oauthClient` callers (`isOAuthOnlyApplication`). They have no app-level role: acting for a user they run with that user's role alone, and acting alone they get no data access, both as on main.
  - Every runtime read of `application.defaultRoleId` listed in the brief now goes through the resolver: permissions service, auth-context role ids, member and agent runs, MCP, REST, user-workspace auth context, the logic-function database-event job, record share and record export, the workflow executor and trigger listener, and the agent inbox.
  - The role → application map that keeps owner rights on an app's own objects now maps the grant to the confined app.
  - The "app without a role adds no restriction" tolerance only applies to the two exempt apps and to OAuth clients. A confined app without a grant has no access.
- **Sync of a confined app** (`normalizeConfinedApplicationManifest`)
  - Its own objects are requested with every action unless the manifest names them.
  - The requested role's assignment flags are forced off.
  - Row-level rules in the requested role are rejected. The SDK rejects them too: `defineApplicationRole()` fails the build.
  - Agents that point at the requested role no longer get an app-owned role target. The grant service assigns them the grant.
- **Install, upgrade and uninstall** (`ApplicationGrantService`, hooked into `applyManifestToWorkspace`)
  - The grant, its object and flag rows, the application target and the agent targets are written in one workspace migration, run as the custom app.
  - The grant is labelled "<App name> role", with a numeric suffix on collision.
  - Install takes the admin's scope for each requested "all objects" switch.
  - On upgrade, what the new request drops is removed from the grant right away, and the admin's additions and restrictions are kept. What it adds becomes pending, and Approve applies it.
  - LOCAL (dev) apps mirror their request on every sync. I checked this with `twenty app dev`.
  - Uninstall deletes the grant and its targets.
- **GraphQL** (all guarded by `APPLICATIONS` + `ROLES`, user sessions only)
  - `applicationGrant(applicationId)`: returns the grant role, locked rows, requested "all objects" actions and pending permissions.
  - `updateApplicationGrantObjectAccess`: the "all objects" switches plus object rows. The server rejects anything below the locked minimum.
  - `approveApplicationGrantPendingPermissions`.
  - `upsertApplicationGrantFieldPermissions` and `upsertApplicationGrantRowLevelPermissionPredicates`: the existing services, run as a system build on the grant.
  - `triggerInstallApplication(input: { grantObjectScopes })`.
  - `Role.canBeAssignedToApplications` and `Role.grantedToApplicationId`.
- **Front**
  - **Pre-install app page**: shows the same "requires" summary as the dialog (`09`).
  - **Install dialog** (`01`):
    - The "requires" card lists everything the app asks for: each "all objects" request with its full reach ("Read all objects, including future ones"), own objects, named objects, flags, capabilities and billing. A single object is named ("Read Companies"); several show their names on hover.
    - A new "Access to your data" section offers "All objects (including future ones)" or "Only these objects" for each requested switch, with an object checklist. Objects the app requires are checked, disabled and locked.
    - A hint points to the Access tab.
  - **Access tab** on the installed app page:
    - It reuses the role editor (all-objects switches, object-level table, field permissions, plan-gated record rules) on the grant's draft (`02` to `05`).
    - Required rows show a lock icon and cannot be removed.
    - "Add rule" and the per-object pages live under the app (Workspace / Apps / Grant demo / Access / …), keep Apps highlighted in the nav, and say "the app" instead of "users" (`03`, `10`).
    - Save and Cancel disappear once the save succeeds.
    - A warning shows when fields or records are hidden.
    - Permission flags are listed read-only, or not shown when none are granted (`11`).
  - **Pending card**: "Version X asks for: …" with Approve (`06`). The card goes away as soon as the approval succeeds. `07` shows the tab after v3 narrowed the grant.
  - **Roles list**: requested roles are hidden. The "Application roles" filter shows grants, with the app they are granted to under "Assigned to", and opens the app's Access tab (`08`).
- **Runtime checks done** (logic function `list-records`, called by the user through its HTTP route, all against `/rest`):
  - The app's own object, the required Companies row and the scoped People row could be read.
  - Opportunities and Pets were denied, even though the request asks to read all objects, because the admin scoped it.
  - After the admin added Pets, then Opportunities in the UI, both became readable. After the admin hid People › Job Title, reading People failed with "no permission to read field jobTitle".
  - v2 → pending "update Companies" → Approve gave update. v3 dropped it again: update was removed, and the admin's additions (Opportunities, Pets) and the field restriction were kept.
  - The agent is assigned to the grant (`getRoles` lists it under "Grant demo role"). I did not run the agent: no LLM provider is configured in this environment.

Tests:
- `application-grant/utils/__tests__/` covers initial grant, scope, locked minimum, pending and narrowing, plus manifest normalization.
- `resolve-application-role-id.util.spec.ts` was rewritten for grants and exempt apps.
- The SDK `define-application-role.spec.ts` covers the row-level rule rejection.
- Typecheck (server, front) and `lint:diff-with-main` (server, front) pass, and so do the unit tests of the touched areas.

## How to try it

1. Run `bash packages/twenty-utils/setup-dev-env.sh`, then `npx nx database:reset twenty-server`. Start the server (`npx nx start twenty-server`), then the worker once the server is up: `cd packages/twenty-server && NODE_ENV=development node dist/queue-worker/queue-worker`. Start the front (`npx nx start twenty-front`). Starting the server and the worker together races on `rimraf dist`.
2. Build the CLI: `npx nx build twenty-cli` (it also rebuilds `twenty-ui/dist`, so reload a running front afterwards). Browser sign-in (`twenty auth login --url http://localhost:3000 --name grant-demo-local`) works. Without a browser, log in with the seeded API key from the repo root. Either way, use a dedicated remote and no `--use`, so your default remote stays as it is:
   ```
   node -e 'process.stdout.write(require("./packages/twenty-server/test/integration/constants/test-tokens.json").API_KEY_ACCESS_TOKEN)' \
     | node packages/twenty-cli/dist/cli.cjs auth login --with-token --url http://localhost:3000 --name grant-demo-local
   ```
   Then `cd packages/twenty-apps/examples/grant-demo && yarn install`.
3. Publish v1 as a private tarball app: `node ../../../twenty-cli/dist/cli.cjs app publish --private -r grant-demo-local`. Pass `-r grant-demo-local` on every CLI call below.
4. In the UI, open Settings › Apps and find "Grant demo" (or open `/settings/applications/available/7f1b2c4e-5a6d-4e8f-9a0b-1c2d3e4f5a61`), then click Install. Under "Read records of", choose "Only these objects", pick People, and Authorize.
5. Open the installed app's **Access** tab. Add a rule (for example Pets, with read), open People and hide Job Title, then Save.
6. Call the function with a user token:
   ```
   curl -X POST localhost:3000/s/list-records -H "Authorization: Bearer <user token>" \
     -H 'Content-Type: application/json' -d '{"objectUniversalIdentifier":"<object universal id>"}'
   ```
   Useful ids: company `20202020-b374-4779-a561-80086cb2e17f`, person `20202020-e674-48e5-a542-72570eee7213`, opportunity `20202020-9549-49dd-b2b2-883999db8938`, demo note `7f1b2c4e-5a6d-4e8f-9a0b-1c2d3e4f5a63`. In the seed, pet is a custom object; read its universal id from metadata.
7. Upgrade: turn on **Auto-upgrade** in the app's General tab once. Then run `yarn use-version 2 1.1.0` and `app publish --private -r grant-demo-local`; the installed app upgrades on its own, so the `upgradeApplication` mutation isn't needed. The pending card shows on the Access tab ("Version 1.1.0 asks for: …"); click Approve.
8. Narrow: run `yarn use-version 3 1.2.0` and publish. After the auto-upgrade, "update Companies" is gone from the grant.

## Shortcuts and hacks

- **The grant is `isEditable: false`.** The generic role APIs therefore cannot touch it, and the grant service and grant mutations run with `isSystemBuild: true`. To allow that, the object permission, field permission and role permission flag validators now skip the "role not editable" check for system builds; the role and row-level validators already did. The "disabled actions on an object" check is also skipped for system builds, because the grant may need owner rights on the app's own objects. The runtime still enforces this through the role → app map.
- **`upsertFieldPermissions` and `upsertRowLevelPermissionPredicates`** got an `isSystemBuild` option so the grant endpoints can reuse them.
- **The runtime role is a computed field on `FlatApplication`.** It is set by the flat application cache, which now also reads `roleTarget` rows and the workspace's custom app id. The cache is invalidated whenever role targets change. An application read from the database instead of the cache falls back to "exempt if it has no approved request".
- **Provenance is not stored per row.** The grant stores only the approved request snapshot. "From the request" means covered by that snapshot; anything else in the grant is treated as the admin's. The pending, narrowing and lock logic reuses `getRoleManifestGrantsNotCoveredBy` from twenty-shared.
- **Tarball registrations now store the full manifest.** Before, they stored only `application`, so the install dialog could not show the requested role until after the first install (`application-tarball.service.ts`).
- **The front reuses the role editor.** `useSaveDraftRoleToDB` takes `grantedApplicationId` and routes saves to the grant mutations. The per-object pages are mounted under the app (`/settings/applications/:id/access/add-object` and `/access/object/:objectMetadataId`) and render the role editor's components. An `ApplicationGrantEditorContext` tells those components to link, label and word things for the app. After a save, the Access tab reloads the saved role and resets the draft to it, because the server normalizes what it stores.
- **Request version.** `application.requestedRoleVersion` (one more generated instance command) records the version whose request was last synced. `application.version` is only written when an install or upgrade completes. Pending computation starts at manifest sync, about ten seconds earlier, so labelling pending permissions with `version` showed the previous version in that window. `approvedRoleRequest` is written in the same reconcile step as the grant, so it has no such window.
- **Per-object page header.** It reads "2. Set People permissions" on an existing row too. Main's regular role editor does the same on existing rows, so the grant pages match it.
- **Requested field permissions are not copied into the grant.** Requested row-level rules cannot exist.
- **Pending labels are plain English strings** built on the server, not translated.
- **Example app versions** are switched by `scripts/use-version.mjs`, which rewrites a constant and `package.json`. The logic function lists objects through the metadata GraphQL API, because `/rest/metadata/objects` needs the `DATA_MODEL` flag.
- **No backfill and no workspace command.** Existing confined apps installed before this change have no grant, so they get no access.

## Deviations from the design

- **Assignment flags.** The grant has `canBeAssignedToAgents` on and the users and API keys flags off, as specified. It is also `isEditable: false` (see above), which the design does not mention. It is what makes it read-only through the generic role APIs while staying editable from the Access tab.
- **Scoped "all objects" on narrowing.** When a request drops an "all objects" action, the switch is turned off. The rows the admin picked for the scope at install are kept, because without per-row provenance they cannot be told apart from admin additions. The example's v3 therefore also drops "update Companies" to show narrowing.
- **Agent targets.** For agents pointing at the requested role, the confined app no longer creates its own target, as specified. An agent that already has a custom-app-owned target (assigned by an admin) is re-pointed to the grant.
- **Install permission.** Installing with a scope does not require `ROLES`. The install mutation keeps its `APPLICATIONS` guard; only the editing and approval endpoints need both flags.
- **Locked actions on the per-object page.** On the Access tab, required rows can't be removed and show a lock. On the per-object page, required actions can still be unchecked in the draft; the server rejects the save with "The grant must keep what the application requires".

## Design questions the POC surfaced

1. **Scope versus additions.** Should the grant store the admin's scope choice for each "all objects" switch separately from the extra rows? Without it, narrowing an "all objects" request cannot remove the scoped rows (see above), and the Access tab cannot show "only these objects" as a scope rather than as plain rows.
2. **Changing the scope after install.** In the role editor the scope looks like generic all-objects switches and object rows. Should the Access tab have a dedicated "Access to your data" control, like the install dialog?
3. **Hidden fields break generic reads.** Hiding a field makes `GET /rest/people` fail outright instead of omitting the field, so a metadata-agnostic app breaks on the first restriction. Should app requests omit restricted fields instead?
4. **Implied read.** A named row such as "update Companies" under a requested "read all objects" makes read on Companies effectively required. The POC locks the effective values of named rows, so admins cannot scope that read away. Is that right?
5. **Take-it-or-leave-it switches on upgrade.** `canAccessAllAgentChatChannels` is outside `getRoleManifestGrantsNotCoveredBy`. The POC copies it from the approved request, so a new request for it is never shown as pending.
6. **The custom app as owner.** The custom app owns the grant's rows. Exporting the custom app skips the grant (non-editable roles are not exported), so a grant is never reproduced in another workspace. Is that the desired behavior for "workspace as code"?
7. **Requested role visibility.** The requested role is hidden from the roles list but still reachable by URL. It is read-only only because it belongs to another app; its `isEditable` stays true. Should it be marked non-editable, or shown inside the Access tab as "what the app asks for"?
8. **Tarball upgrades in the UI.** There is no "update" button for private tarball apps; the POC relies on Auto-upgrade (General tab) to pick up a newly published version. Should admins be able to upgrade a tarball app manually, and should an upgrade that leaves permissions pending warn before or after it runs?
9. **Agents without a role.** An agent that declares no role gets no target, and so no grant. Should every agent of a confined app run with the grant by default?
10. **Narrowing is silent.** When a new version asks for less, the removed access is taken from the grant during the upgrade, and nothing tells the admin (in the example, v3 removes "update Companies" with no notice). Should the Access tab or the app's General tab show what the last upgrade removed?
11. **OAuth clients beyond v1.** Settled for v1 in the design doc: OAuth-only registrations stay outside the request and grant model (see "What works"). Whether a later version should give them a grant made at authorization time is still open.
12. **Default install scope.** The dialog preselects "All objects (including future ones)" for each requested switch. It is the only grant that keeps growing without a new approval, so should the default be "Only these objects", with required objects locked? The cost is that an app that needs everything (sync, search) runs with less until the admin widens it. If the admin narrows at install, should the Access tab show what the app asked for but did not get, like the pending card does on upgrade?
