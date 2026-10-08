# Working on this Twenty app

This file lists the rules the Twenty build and sync enforce, so an agent gets them right the first time. Install the official agent skills for step-by-step workflows that go beyond it:

```bash
npx skills add https://github.com/twentyhq/twenty/tree/agent-skills --skill '*'
```

Skills: `create-app`, `develop-app`, `manage-app`, `publish-app`, `use-twenty-mcp`. When they are installed, follow them.

## Documentation

Every page below is served as Markdown when you append `.md` to its URL. The full developer index is at https://docs.twenty.com/_llms/en/developers.md.

- Getting started: https://docs.twenty.com/developers/extend/apps/getting-started/ `quick-start`, `concepts`, `project-structure`, `local-server`, `scaffolding`, `troubleshooting`
- Config: https://docs.twenty.com/developers/extend/apps/config/ `overview`, `application`, `roles`, `install-hooks`, `public-assets`
- Data: https://docs.twenty.com/developers/extend/apps/data/ `overview`, `objects`, `extending-objects`, `relations`, `system-fields`, `timeline-activity-types`
- Logic: https://docs.twenty.com/developers/extend/apps/logic/ `overview`, `logic-functions`, `skills-and-agents`, `connections`, `background-jobs`, `key-value-store`, `messaging-channels`, `credits`
- Layout: https://docs.twenty.com/developers/extend/apps/layout/ `overview`, `views`, `navigation-menu-items`, `page-layouts`, `front-components`, `command-menu-items`
- Operations: https://docs.twenty.com/developers/extend/apps/operations/ `overview`, `cli`, `sync-and-recovery`, `testing`, `translations`, `publishing`
- End-to-end tutorial: https://docs.twenty.com/developers/extend/apps/tutorials/document-generator/overview.md
- Example apps: https://github.com/twentyhq/twenty/tree/main/packages/twenty-apps/examples (`postcard`, `document-generator`, `media-notes`, `hello-world`). The test fixture https://github.com/twentyhq/twenty/tree/main/packages/twenty-apps/fixtures/rich-app exercises every entity type, including cron and database-event triggers, indexes, view fields and timeline activity types.

## Commands

| Task                                | Command                                                  |
| ----------------------------------- | -------------------------------------------------------- |
| Sync once to the active remote      | `yarn twenty apply` (`--no-delete`, `--force`)           |
| Preview what a sync would change    | `yarn twenty plan` (writes nothing)                      |
| Typecheck against the generated SDK | `yarn twenty dev:typecheck`                              |
| Lint                                | `yarn lint`                                              |
| Unit tests                          | `yarn test:unit`                                         |
| Integration tests (needs a server)  | `yarn test`                                              |
| Run a logic function by hand        | `yarn twenty dev:function:exec -n <name> -p '{"k":"v"}'` |
| Stream logic function logs          | `yarn twenty dev:function:logs`                          |
| Remove the app from the workspace   | `yarn twenty app:uninstall --yes`                        |
| Scaffold an entity (interactive)    | `yarn twenty dev:add <entityType>` (`--path <dir>`)      |

- Sync with `yarn twenty apply`. Do not run `yarn twenty dev` (watch mode) from an agent: it never exits and its output is ambiguous in a sandbox.
- A sync deletes every entity your app owns that the source no longer declares. Without a TTY, a plan that destroys objects or fields stops the sync; review `yarn twenty plan`, then re-run with `--force`, or use `--no-delete` while the source is intentionally partial.
- Run typecheck and lint once after a batch of edits, not after every file.
- `apply` typechecks before it syncs and regenerates `twenty-client-sdk` in `node_modules`. Code that queries a brand-new object with `CoreApiClient` fails typecheck on the first apply: sync the data model first, then write the code that uses it.
- One sync at a time per workspace. Never run several `apply`, `dev` or `app:install` in parallel.
- Local iteration never needs a `package.json` version bump. The strictly-increasing version rule applies to `app:publish` and `app:install` only.
- Build and sync errors name the metadata type and `universalIdentifier` of the failing entity. Search the source for that identifier instead of guessing.

## Scaffolding entities

`yarn twenty dev:add` generates the file, a valid `universalIdentifier` and the right imports. Prefer it over writing entity files by hand. It prompts for names and options, so it needs an interactive terminal. Without one, use the standalone `twenty` CLI when it is installed: `twenty app add object --name invoice --name-plural invoices --no-input`, or `twenty app add field --name amount --type NUMBER --object <uuid> --no-input`. It covers objects, fields, logic functions and front components, never prompts with `--no-input` or `--json`, and exits with code 2 when a required value is missing. When the shell has no terminal and the standalone CLI is not installed, `dev:add` fails at once with `User force closed the prompt`. If the user is available, ask them to run the exact `yarn twenty dev:add <entityType>` command in their own terminal; for an object this is the best option, since it also generates the table view, navigation menu item and record page layout. Otherwise write the file by hand: follow the example on the matching docs page (append `.md` to its URL), or an existing file of the same kind in the app, check the shape against the types exported by `twenty-sdk/define`, and generate every identifier with `crypto.randomUUID()` instead of inventing one.

| Entity type            | Command                                    | Generated file                          |
| ---------------------- | ------------------------------------------ | --------------------------------------- |
| Object                 | `yarn twenty dev:add object`               | `src/objects/<name>.ts`                 |
| Field                  | `yarn twenty dev:add field`                | `src/fields/<name>.ts`                  |
| Logic function         | `yarn twenty dev:add logicFunction`        | `src/logic-functions/<name>.ts`         |
| Front component        | `yarn twenty dev:add frontComponent`       | `src/front-components/<name>.tsx`       |
| Role                   | `yarn twenty dev:add role`                 | `src/roles/<name>.ts`                   |
| Skill                  | `yarn twenty dev:add skill`                | `src/skills/<name>.ts`                  |
| Agent                  | `yarn twenty dev:add agent`                | `src/agents/<name>.ts`                  |
| View                   | `yarn twenty dev:add view`                 | `src/views/<name>.ts`                   |
| View field             | `yarn twenty dev:add viewField`            | `src/view-fields/<name>.ts`             |
| Navigation menu item   | `yarn twenty dev:add navigationMenuItem`   | `src/navigation-menu-items/<name>.ts`   |
| Page layout            | `yarn twenty dev:add pageLayout`           | `src/page-layouts/<name>.ts`            |
| Page layout tab        | `yarn twenty dev:add pageLayoutTab`        | `src/page-layout-tabs/<name>.ts`        |
| Page layout widget     | `yarn twenty dev:add pageLayoutWidget`     | `src/page-layout-widgets/<name>.ts`     |
| Command menu item      | `yarn twenty dev:add commandMenuItem`      | `src/command-menu-items/<name>.ts`      |
| Settings menu item     | `yarn twenty dev:add settingsMenuItem`     | `src/settings-menu-items/<name>.ts`     |
| Connection provider    | `yarn twenty dev:add connectionProvider`   | `src/connection-providers/<name>.ts`    |
| Timeline activity type | `yarn twenty dev:add timelineActivityType` | `src/timeline-activity-types/<name>.ts` |

`dev:add object` also offers to generate the table view, the navigation menu item, the record page layout and its fields view, which is what makes the object usable. A field added to that object later is not shown on the record page until it is listed in `src/views/<name>-record-page-fields.ts`. Generated files use `fill-later` and `replace-with-existing-...` placeholders for identifiers the scaffolder cannot know; the build does not catch them, so replace every placeholder before syncing.

## Rules the build and sync enforce

### Entity files

- An entity is any `.ts` or `.tsx` file in the project whose top-level statement is `export default defineX(...)` as a direct call. Assigning the call to a variable first, calling it through a namespace, or adding `satisfies` makes the build skip the file silently, and a skipped entity is deleted on the next sync. Folder placement is a convention, not a rule.
- Every entity file runs in Node at build time, front components included. No browser globals at module top level.
- Exactly one `defineApplication()` per app, and exactly one default role: either a `defineApplicationRole()` (what the scaffold ships) or a `defineRole()` referenced by `defaultRoleUniversalIdentifier` in `defineApplication()`. Never add a second one to an app that already has either. At most one pre-install hook, post-install hook, uninstall hook and health check. The scaffolded `health-check.ts` is that one health check; edit it, never add a second.
- Object and field names match `^[a-z][a-zA-Z0-9]*$`, singular and plural differ, and neither is a reserved keyword (`user`, `workspace`, `role`, `event`, `type`, `field`, `link`, `address`, `search`, `index`, `plan`, `object`, `relation`, `currency`, `job`, ...). These fail only at sync time.

### Identifiers

- `universalIdentifier` must be a UUID of version 4 or higher and unique across the whole manifest, nested items included (view fields, tabs, widgets, select options, triggers, application variables).
- Never change an identifier after the first sync: the server sees a delete plus a create, and the data goes with the delete.
- Cross-references are always `universalIdentifier` strings, never imports of the entity. Export the identifier as a named constant and import that constant; this also avoids circular imports between the two sides of a relation. Standard objects and page layouts are in `STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS` and `STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS` from `twenty-sdk/define`.
- Two references use names instead: a database event trigger's `eventName` uses the object's `nameSingular` (`company.created`), and a connection provider's `clientIdVariable` / `clientSecretVariable` use server variable keys.

### Data model

- Do not declare `id`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy` or `deletedAt`: Twenty adds them. `name` is the one default field you may declare, and `dev:add object` does so to use it as the label identifier; keep that declaration and its identifier, since removing it injects a different `name` field and breaks the views that reference the old one.
- A relation is two `FieldType.RELATION` fields that point at each other through `relationTargetFieldMetadataUniversalIdentifier`. The `MANY_TO_ONE` side must set `universalSettings.joinColumnName`. Relating to a standard object still requires declaring the reverse field on it with `defineField({ objectUniversalIdentifier })`.
- Literal string defaults are quoted inside the string: `defaultValue: "'DRAFT'"`. Unquoted strings are reserved for `'uuid'` and `'now'`. `SELECT` option values are `UPPER_SNAKE_CASE`, and option `color` comes from the Twenty tag colors.
- Turning an existing field into `isNullable: false` requires a non-null `defaultValue`, or the sync fails.

### Layout

- A usable object is object + table view + navigation menu item (`type: OBJECT`) + record page layout. A view or an object without a navigation menu item is not reachable from the sidebar. Color is set on the navigation menu item, not on `defineObject`.
- Set `layoutMode` on every page layout tab: `VERTICAL_LIST` for record and standalone pages, `GRID` for dashboards. `CANVAS` tabs are deprecated. In a `VERTICAL_LIST` tab, order comes from the `widgets` array and `position` is deprecated; `GRID` widgets and standalone `definePageLayoutWidget()` still need an explicit `position`, or every card lands on row 0, column 0.
- A widget must fit its width-driven container without scrolling, unless it is the single `heightBehavior: 'TAB_VIEWPORT'` widget of its tab, placed last.
- Widgets reference app components through `frontComponentUniversalIdentifier`, not `frontComponentId`.

### Front components

- The file is `.tsx` and ends with `export default defineFrontComponent({ ... })` in exactly that shape; the build rewrites it.
- Components run in a Web Worker with a sandboxed, partial `window` and `document`: DOM queries, measurements and `matchMedia` work, but `ResizeObserver`, `canvas`, `scrollIntoView` and portals into `document.body` do not, and most unsupported calls fail silently. Base layout on width, never on height. Import UI from `twenty-ui` subpaths and never `IconsProvider` or `useIcons`.
- Read workspace data with `CoreApiClient` from `twenty-client-sdk/core`. Call third-party APIs from a logic function, not from the component. Secret application variables never reach a front component.
- `useRecordId()` is deprecated; use `useSelectedRecordIds()` from `twenty-sdk/front-component`.

### Logic functions

- The handler is `(payload, context)`. The payload shape follows the trigger: `RoutePayload` for HTTP routes, `DatabaseEventPayload` (or the batch variant, up to 200 events) for database events, `{}` for cron, `{ previousVersion?, newVersion }` for install hooks.
- HTTP routes are served under `/s/<path>`; request header names are lowercase. `timeoutSeconds` is between 1 and 900, default 300.
- `new CoreApiClient()` authenticates from the injected environment and acts as the person who triggered the run, narrowed to the app's role; `runAs: 'application'` uses the app's own role. Never declare `TWENTY_API_URL`, `TWENTY_APP_ACCESS_TOKEN`, `TWENTY_APP_APPLICATION_ACCESS_TOKEN`, `TWENTY_API_KEY`, `TWENTY_FUNCTIONS_URL` or `APPLICATION_ID` as variables: sync rejects them.
- Import runtime helpers from `twenty-sdk/logic-function` and `twenty-sdk/utils` (`isDefined`, `getPublicAssetUrl`). The `isDefined` exported by `twenty-sdk/define` is a conditional-availability variable and fails the build anywhere outside `conditionalAvailabilityExpression`.
- Give tool and workflow-action functions a specific `description`: agents choose tools by it.

### Dependencies

- `twenty-sdk`, `twenty-client-sdk` and `twenty-ui` stay in `devDependencies`, all at the same version. `dependencies` is only for packages logic functions import at runtime; the runtime layer is capped at 250 MB unpacked.
