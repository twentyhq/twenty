# POC: granted roles for confined apps

Proof of concept for the "requested role / granted role" design (core-team-issues#3139). A confined (marketplace) app keeps declaring a role with `defineApplicationRole()`, but that role is now only a request. At install the workspace builds a **grant**, a role owned by the workspace custom app, from the request plus the admin's choices. The app and its agents run with the grant alone.

Screenshots are in `poc-screenshots/`. Numbers `01` to `07` are referenced below.

v1 is object-level only. The admin decides two things: which objects an "all objects" request covers (all objects, including future ones, or a chosen list), and extra objects, each with an access level. Permission flags are exactly as requested, and grants have no field permissions or row-level rules: an app's default role and the roles its agents use can't declare either. Standalone roles meant for members keep both.

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
  - Field permissions and row-level rules in the requested role, or in a role one of its agents uses, are rejected. The build rejects them too: `defineApplicationRole()` fails on them, and the CLI rejects them on agent roles. Roles no agent uses keep both.
  - Agents that point at the requested role no longer get an app-owned role target. The grant service assigns them the grant.
- **Install, upgrade and uninstall** (`ApplicationGrantService`, hooked into `applyManifestToWorkspace`)
  - The grant, its object and flag rows, the application target and the agent targets are written in one workspace migration, run as the custom app.
  - The grant is labelled "<App name> role", with a numeric suffix on collision.
  - Install creates the grant from the request, or from the admin's object access choices (`buildGrantRoleManifestFromObjectAccess` in twenty-shared). Choices go through the same locked-minimum check as Access tab saves (`computeGrantMissingLockedPermissions`, also in twenty-shared). That check runs before the install job is queued, so a rejected choice installs nothing.
  - Access levels are record sharing's (`RecordShareAccessLevel`), mapped to object permissions the way record sharing maps them to operations: Read = read; Read & write = read + update; Full = read + update + delete + destroy.
  - On upgrade, what the new request drops is removed from the grant right away, and the admin's additions are kept. What it adds becomes pending, and Approve applies it.
  - LOCAL (dev) apps mirror their request on every sync. I checked this with `twenty app dev`.
  - Uninstall deletes the grant and its targets.
- **GraphQL** (all guarded by `APPLICATIONS` + `ROLES`, user sessions only)
  - `applicationGrant(applicationId)`: returns the grant role, locked rows, requested "all objects" actions, pending permissions, and `objectAccess` (the chosen objects, or null for all objects, and the added objects with their level).
  - `updateApplicationGrantObjectAccess(input: { applicationId, objectAccess })`. The server rejects anything below the locked minimum.
  - `approveApplicationGrantPendingPermissions`.
  - `triggerInstallApplication(input: { grantObjectAccess })`, same shape as `objectAccess`. Omitted, the grant is exactly the request, under the usual `APPLICATIONS` guard. Sent, it also needs `ROLES`, like every other grant edit.
  - `Role.canBeAssignedToApplications` and `Role.grantedToApplicationId`.
- **Front**
  - **One list for grants** (`SettingsApplicationGrantObjectAccessList`), used at install and in the Access tab. It does not use the role editor.
    - An "all objects" request is one row at the top: "All objects (including future ones)" or "Chosen objects". Chosen objects get the requested "all objects" level and can be removed.
    - Required rows show their level and a lock. A requested row whose actions match no level (read, update and delete without destroy) is shown as requested, for example "read, update, delete", and stays locked.
    - "Add object" picks an object and a level (Read, Read & write, Full). Added rows can change level or be removed; removing is how you get "none".
  - **Pre-install app page**: the "requires" card lists everything the app asks for, with each "all objects" request at its full reach ("Read all objects, including future ones") (`07`).
  - **Install dialog** (`01`): the card with what the list can't show (the app's own objects, which don't exist yet, permission flags, capabilities, billing), then the list, read-only. **Customize** (shown only with `ROLES`) makes the list editable in place (`02`). Authorize without changes installs exactly the request.
  - **Access tab** on the installed app page: the same list, editable, with Save and Cancel (`03`), the pending card above it, and the granted permission flags listed read-only.
  - **Pending card**: "Version X asks for: …" with Approve (`04`). The card goes away as soon as the approval succeeds (`05`).
  - **Roles list**: requested roles are hidden. The "Application roles" filter shows grants, with the app they are granted to under "Assigned to", and opens the app's Access tab (`06`).
- **Runtime checks done** (logic function `list-records`, called by the user through its HTTP route, all against `/rest`):
  - A one-click install gave a grant equal to the request (read all objects, Companies read and update, own object).
  - A customized install (Chosen objects: People; Opportunities added at Read & write) gave exactly that grant. Companies, People, Opportunities and the app's own object could be read; Pets was denied. For about twenty seconds right after the install, every call except the own object answered 401 "Invalid auth context"; it then settled.
  - Adding Pets at Read in the Access tab and saving made Pets readable.
  - Upgrades: v1 (narrower) removed update on Companies and kept the admin's choices. v2 showed "update Companies" as pending, and Approve granted it. v3 dropped it again; it also drops the "all objects" request, so the chosen objects then show as added objects at Read.
  - A `triggerInstallApplication` call below the locked minimum is rejected before the job is queued (checked with the previous install input; the check is unchanged).
  - OAuth: browser `twenty auth login`, then `app publish --private` and `getRoles` with that token, all worked. With its grant removed, the grant demo's route was denied.
  - The agent is assigned to the grant (`getRoles` lists it under "Grant demo role"). I did not run the agent: no LLM provider is configured in this environment.
  - Field permissions and row-level rules: a field permission on grant-demo's requested role failed the build ("Application roles cannot declare field permissions"), and so did a member role with a field permission and a row-level rule once the agent pointed at it. The same member role, used by no agent, built and installed with both.

Tests:
- `application-grant/utils/__tests__/` covers the install grant, scope, locked minimum, pending and narrowing, plus manifest normalization. `twenty-shared` `grantObjectAccess.test.ts` covers building a grant from object access and reading it back.
- `resolve-application-role-id.util.spec.ts` was rewritten for grants and exempt apps.
- The SDK `define-application-role.spec.ts` covers the field permission and row-level rule rejections; the CLI `validate-agent-roles-within-application-role.spec.ts` covers them for agent roles; `normalize-confined-application-manifest.util.spec.ts` covers the server sync.
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
4. In the UI, open Settings › Apps and find "Grant demo" (or open `/settings/applications/available/7f1b2c4e-5a6d-4e8f-9a0b-1c2d3e4f5a61`), then click Install. Click Customize, switch the top row to "Chosen objects", choose People, add Opportunities at Read & write, and Authorize. (Authorize without customizing grants exactly the request.)
5. Open the installed app's **Access** tab. Add Pets at Read, then Save.
6. Call the function with a user token:
   ```
   curl -X POST localhost:3000/s/list-records -H "Authorization: Bearer <user token>" \
     -H 'Content-Type: application/json' -d '{"objectUniversalIdentifier":"<object universal id>"}'
   ```
   Useful ids: company `20202020-b374-4779-a561-80086cb2e17f`, person `20202020-e674-48e5-a542-72570eee7213`, opportunity `20202020-9549-49dd-b2b2-883999db8938`, demo note `7f1b2c4e-5a6d-4e8f-9a0b-1c2d3e4f5a63`. In the seed, pet is a custom object; read its universal id from metadata.
7. Upgrade: turn on **Auto-upgrade** in the app's General tab once. Then run `yarn use-version 2 1.1.0` and `app publish --private -r grant-demo-local`; the installed app upgrades on its own, so the `upgradeApplication` mutation isn't needed. The pending card shows on the Access tab ("Version 1.1.0 asks for: …"); click Approve.
8. Narrow: run `yarn use-version 3 1.2.0` and publish. After the auto-upgrade, "update Companies" is gone from the grant.

## Shortcuts and hacks

- **The grant is `isEditable: false`.** The generic role APIs therefore cannot touch it, and the grant service and grant mutations run with `isSystemBuild: true`. To allow that, the object permission and role permission flag validators now skip the "role not editable" check for system builds; the role and row-level validators already did. The "disabled actions on an object" check is also skipped for system builds, because the grant may need owner rights on the app's own objects. The runtime still enforces this through the role → app map.
- **The runtime role is a computed field on `FlatApplication`.** It is set by the flat application cache, which now also reads `roleTarget` rows and the workspace's custom app id. The cache is invalidated whenever role targets change. An application read from the database instead of the cache falls back to "exempt if it has no approved request".
- **Provenance is not stored per row.** The grant stores only the approved request snapshot. "From the request" means covered by that snapshot; anything else in the grant is treated as the admin's. The pending, narrowing and lock logic reuses `getRoleManifestGrantsNotCoveredBy` from twenty-shared.
- **Tarball registrations now store the full manifest.** Before, they stored only `application`, so the install page could not show the requested role until after the first install (`application-tarball.service.ts`).
- **Chosen versus added objects are inferred.** Without per-row provenance, a row that grants exactly the requested "all objects" actions, under a narrowed scope, reads back as a chosen object; any other extra row reads back as an added object (`getGrantObjectAccess`). So an object added at the same level as the "all objects" request shows as chosen after a reload.
- **Request version.** `application.requestedRoleVersion` (one more generated instance command) records the version whose request was last synced. `application.version` is only written when an install or upgrade completes. Pending computation starts at manifest sync, about ten seconds earlier, so labelling pending permissions with `version` showed the previous version in that window. `approvedRoleRequest` is written in the same reconcile step as the grant, so it has no such window.
- **The postcard example and the rich-app fixture** declared field permissions in their default role; those entries are removed so they still build.
- **Pending labels are plain English strings** built on the server, not translated.
- **Example app versions** are switched by `scripts/use-version.mjs`, which rewrites a constant and `package.json`. The logic function lists objects through the metadata GraphQL API, because `/rest/metadata/objects` needs the `DATA_MODEL` flag.
- **No backfill and no workspace command.** Existing confined apps installed before this change have no grant, so they get no access.

## Deviations from the design

- **Assignment flags.** The grant has `canBeAssignedToAgents` on and the users and API keys flags off, as specified. It is also `isEditable: false` (see above), which the design does not mention. It is what makes it read-only through the generic role APIs while staying editable from the Access tab.
- **Scoped "all objects" on narrowing.** When a request drops an "all objects" action, the switch is turned off. The rows the admin picked for the scope at install are kept, because without per-row provenance they cannot be told apart from admin additions. The example's v3 therefore also drops "update Companies" to show narrowing.
- **Agent targets.** For agents pointing at the requested role, the confined app no longer creates its own target, as specified. An agent that already has a custom-app-owned target (assigned by an admin) is re-pointed to the grant.
- **Own objects at install.** The list can't show the app's own objects before install, because they don't exist yet. They stay a line in the "requires" card and are always granted.

## Design questions the POC surfaced

1. **Scope versus additions.** Should the grant store the admin's scope choice separately from the extra rows? Without it, narrowing an "all objects" request cannot remove the chosen objects (see above), and an object added at the "all objects" level reads back as a chosen one.
2. **One "all objects" level.** The list shows one top row for the "all objects" request, at the requested level. A request with read on all objects and update on all objects gets one scope for both; the POC does not let the admin scope them separately.
3. **Hidden fields break generic reads.** A field permission that hides a field makes `GET /rest/<object>` fail outright instead of omitting the field. If grants get field permissions in a later version, should app requests omit restricted fields instead?
4. **Implied read.** A named row such as "update Companies" under a requested "read all objects" makes read on Companies effectively required. The POC locks the effective values of named rows, so admins cannot scope that read away. Is that right?
5. **Take-it-or-leave-it switches on upgrade.** `canAccessAllAgentChatChannels` is outside `getRoleManifestGrantsNotCoveredBy`. The POC copies it from the approved request, so a new request for it is never shown as pending.
6. **The custom app as owner.** The custom app owns the grant's rows. Exporting the custom app skips the grant (non-editable roles are not exported), so a grant is never reproduced in another workspace. Is that the desired behavior for "workspace as code"?
7. **Requested role visibility.** The requested role is hidden from the roles list but still reachable by URL. It is read-only only because it belongs to another app; its `isEditable` stays true. Should it be marked non-editable, or shown inside the Access tab as "what the app asks for"?
8. **Tarball upgrades in the UI.** There is no "update" button for private tarball apps; the POC relies on Auto-upgrade (General tab) to pick up a newly published version. Should admins be able to upgrade a tarball app manually, and should an upgrade that leaves permissions pending warn before or after it runs?
9. **Agents without a role.** An agent that declares no role gets no target, and so no grant. Should every agent of a confined app run with the grant by default?
10. **Narrowing is silent.** When a new version asks for less, the removed access is taken from the grant during the upgrade, and nothing tells the admin (in the example, v3 removes "update Companies" with no notice). Should the Access tab or the app's General tab show what the last upgrade removed?
11. **OAuth clients beyond v1.** Settled for v1 in the design doc: OAuth-only registrations stay outside the request and grant model (see "What works"). Whether a later version should give them a grant made at authorization time is still open.
12. **What the app asked for but didn't get.** Authorize without changes grants each "all objects" request as asked, so approval stays one click. If the admin narrows it at install, nothing in the Access tab shows what the app asked for but did not get, unlike the pending card on upgrade. Should it?
