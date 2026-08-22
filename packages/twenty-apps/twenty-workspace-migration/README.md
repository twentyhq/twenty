# Twenty Workspace Migration

A Twenty App that migrates data from one Twenty workspace into another over the public GraphQL/REST APIs - objects and fields, records, views, navigation menu items, skills, webhooks, roles, dashboards, record page layouts, and attachments (including the underlying uploaded files).

## Features

- **Schema sync** - compares custom and standard objects/fields between the source and target workspace and recreates whatever's missing (relation dependencies are respected, so a field can't be created before the object it points at exists).
- **Record migration** - copies records for every non-system, non-omitted object, in dependency order, remapping relation foreign keys from source-workspace ids to target-workspace ids as it goes.
- **Views, dashboards, record page layouts, navigation menu items, skills, webhooks, roles** - migrated with their sub-entities (view filters/sorts/groups, page layout tabs/widgets, role permissions and row-level permission predicates, etc.), deduplicated against the target workspace where a stable id or natural key exists. A navigation menu item that links directly to a dashboard or a custom record page layout resolves correctly because dashboards and page layouts are migrated first.
- **Attachments** - each attachment's underlying file is downloaded from the source workspace and re-uploaded into the target workspace's own storage before the record is created, since files are stored workspace-scoped server-side. Attachment target links are discovered dynamically from the live schema, so this covers any non-system object - standard (Company, Person, ...) or custom (user-created or app-installed) - not just a fixed list.
- **Duration estimate** - before any data moves, the migration logs a worst-case time estimate based on record counts and non-batchable entity counts (views, dashboards, page layouts, attachments, ...), so you know roughly what to expect.
- **Checkpointing and self-resumption** - migration progress is saved to this app's own key-value store after every stage (and periodically during long stages), and the app re-triggers its own HTTP route to continue automatically - a run cut off by the platform's timeout picks back up on its own rather than needing a manual re-invocation.

## How it works

The migration runs as a single logic function (`src/logic-functions/entry-point.ts`), organized into stages:

1. Read installed apps and workspace members (source and target must have the same apps at the same version; missing workspace members are reported instead of silently dropping their data), then log a worst-case duration estimate.
2. Compare objects and fields between the two workspaces, recreate missing ones and update ones that differ, and precompute the attachment target-field mapping used later by stage 8.
3. Migrate records, in relation-dependency order.
4. Migrate views.
5. Migrate dashboards.
6. Migrate custom record page layouts.
7. Migrate navigation menu items, skills, webhooks, and roles - deliberately after dashboards and record page layouts, since a navigation menu item can link directly to either.
8. Migrate attachments (and their files).

A logic function has a hard execution timeout; this app tracks its own elapsed runtime and stops cleanly at a stage/object boundary before that limit hits, checkpoints its state, and triggers a fresh invocation of itself to continue - rather than being killed mid-request or requiring a manual re-run.

## Configuration

The logic function reads these environment variables (configure them wherever this app's environment variables are set for the installation running the migration):

| Variable | Description |
| --- | --- |
| `SOURCE_WORKSPACE_API_URL` | Base API URL of the workspace to migrate **from**. |
| `SOURCE_WORKSPACE_API_KEY` | API key for the source workspace. |
| `TARGET_WORKSPACE_API_URL` | Base API URL of the workspace to migrate **to**. |
| `TARGET_WORKSPACE_API_KEY` | API key for the target workspace. |

The target workspace must already have every workspace member that owns/is assigned records in the source workspace (matched by email) - the migration reports missing members and stops rather than silently dropping that data.

## Known limitations

- **Workflows aren't migrated** (`workflow`, `workflowRun`, `workflowVersion`, `workflowAutomatedTrigger`) - the public API doesn't allow creating or fully updating workflow versions for API-key callers, so there's no way to recreate a workflow's steps/trigger through this tool.
- **Activity history isn't migrated** (`timelineActivity`) - a deliberate choice, not an API limitation; audit history tied to the source workspace generally isn't meaningful to replay into a new one.
- **Row-level permission predicates require an Enterprise plan on both workspaces.** They're migrated best-effort; if the target workspace's plan doesn't have the feature enabled, that role's predicates are skipped with a warning instead of failing the whole migration.
- **Re-running isn't fully idempotent.** Views, skills, webhooks, dashboards, roles, and attachments are deduplicated (by reused id, natural key, or label), but plain record migration has no dedupe by source id - re-running after records were already created will create duplicates.

## Getting started

Setup instructions live in [SETUP.md](SETUP.md).

## Publishing

The `Publish` workflow (`.github/workflows/publish.yml`) publishes the app to npm with provenance using [npm trusted publishing](https://docs.npmjs.com/trusted-publishers). To publish:

1. On npmjs.com register this repository as a trusted publisher of your package, pointing at the `publish.yml` workflow.
2. Bump the version in `package.json`, then push a version tag (e.g. `git tag v1.0.0 && git push --tags`) or run the workflow manually from the Actions tab.

Publishing with provenance is also how you prove ownership when claiming your app in a Twenty marketplace.

## Changelog

Notable changes are documented in [CHANGELOG.md](CHANGELOG.md).

## Caveats
- if API names of custom objects' standard fields (name, createdBy, createdAt, etc.) are changed, they'll be recreated instead of updated as the only identifying field is no longer the same 

## Learn more

- [Twenty Apps documentation](https://docs.twenty.com/developers/extend/apps/getting-started/quick-start)
- [twenty-sdk CLI reference](https://www.npmjs.com/package/twenty-sdk)
- [Discord](https://discord.gg/cx5n4Jzs57)
