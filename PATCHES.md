# PATCHES.md

Local changes on `travis` that are not present in `upstream-main`. Prefer a new file over an edit to an upstream file. Rebase onto a release tag, never merge `main`.

Fork point: `twenty/v2.31.1` (matches the live `travis-twenty` image; the original handoff named `twenty/v2.30.0`, which would have been a downgrade).

## Upgrade procedure

Per upstream application release (`twenty/vX.Y.Z`, not `sdk/vX.Y.Z`):

1. `git fetch upstream --tags`
2. Create a named Fly volume snapshot of `travis-twenty-db` (`twenty_db_data`) and trigger `travis-twenty-backup` for a Tigris dump. Production is unmanaged Fly Postgres, not Neon.
3. `git rebase twenty/vX.Y.Z` onto `travis`.
4. Resolve conflicts against this file. Any conflicting `upstream-edit` marked `Could this be a new file instead: yes` is converted at that point rather than re-resolved.
5. Build the GHCR image, `fly deploy --image ghcr.io/travis-gilbert/twenty:<tag>`, verify custom objects and Kanban views.

Rebase rather than merge. The patch set stays a sequence of commits on top of a known tag.

## P001. Board column width and title wrapping

Files: `packages/twenty-front/src/modules/object-record/record-board/constants/RecordBoardColumnWidth.ts`, `packages/twenty-front/src/modules/object-record/record-board/styles/RecordBoardColumnTitleWrap.css`, `packages/twenty-front/src/modules/object-record/record-board/record-board-column/components/RecordBoardColumn.tsx`
Type: upstream-edit (constant + one import) and new-file (stylesheet)
Why: Replace the published-image sed injection; 380px columns with titles wrapping to three lines on the board only.
Could this be a new file instead: no for the constant, because it is the value's single source of truth; yes for wrapping, and wrapping is a new file.
Upstream equivalent: none

## P002. twenty-desktop Tauri shell

Files: `packages/twenty-desktop/**`
Type: new-file
Why: Dock and menu bar presence, global shortcut to focus, native notifications, and deep links to a record URL, pointing at the Fly deployment rather than bundling the frontend.
Could this be a new file instead: yes
Upstream equivalent: none

## P003. Fork image GitHub Actions workflow

Files: `.github/workflows/fork-image.yml`
Type: new-file
Why: Build `packages/twenty-docker/twenty/Dockerfile` on GitHub Actions and publish `ghcr.io/travis-gilbert/twenty` tagged with the upstream version and the fork SHA, so Fly deploys do not wait on a remote builder.
Could this be a new file instead: yes
Upstream equivalent: none (upstream CD lives in `twentyhq/twenty-infra`)

## P004. Fly source-build fallback config

Files: `fly.travis.toml`
Type: new-file
Why: GitHub Actions is the intended image publisher; this config is the Fly remote-builder fallback when GHCR is unavailable, with dockerfile paths resolved from the repository root.
Could this be a new file instead: yes
Upstream equivalent: none

## P005. Published-image overlay for Fly

Files: `packages/twenty-docker/overlay/**`
Type: new-file
Why: GitHub Actions is billing-locked and a from-source Fly build OOMs. Overlay `twentycrm/twenty:v2.31.1` with a rebuilt frontend and twenty-shared dist (`ViewType.RELATIONS`) plus an idempotent `view_type_enum` ALTER. Deploy from the repo root with `packages/twenty-docker/overlay/fly.toml` after pushing the image; flyctl's classic builder talks Docker :2375 while this org's builder is BuildKit :1234.
Could this be a new file instead: yes
Upstream equivalent: none. Retire this overlay once `ghcr.io/travis-gilbert/twenty` publishes from the full Dockerfile.

## P006. Relations view type

Files:
- `packages/twenty-shared/src/types/ViewType.ts` (upstream-edit)
- `packages/twenty-shared/src/utils/views/getViewLayoutFromViewType.ts` (upstream-edit)
- `packages/twenty-front/src/modules/views/types/ViewType.ts` (upstream-edit)
- `packages/twenty-front/src/generated-metadata/graphql.ts` (upstream-edit)
- `packages/twenty-front/src/modules/views/view-picker/constants/ViewPickerTypeSelectOptions.ts` (upstream-edit)
- `packages/twenty-front/src/modules/object-record/object-options-dropdown/components/ObjectOptionsDropdownLayoutContent.tsx` (upstream-edit)
- `packages/twenty-front/src/modules/object-record/object-options-dropdown/hooks/useSetViewTypeFromLayoutOptionsMenu.ts` (upstream-edit)
- `packages/twenty-front/src/modules/object-record/record-index/components/RecordIndexContainer.tsx` (upstream-edit)
- `packages/twenty-front/src/modules/object-record/record-index/hooks/useRecordIndexTableQuery.ts` (upstream-edit)
- `packages/twenty-front/src/modules/object-record/components/RecordComponentInstanceContextsWrapper.tsx` (upstream-edit)
- `packages/twenty-front/src/modules/context-store/utils/getContextStoreViewType.ts` (upstream-edit)
- `packages/twenty-server/src/engine/metadata-modules/view/tools/view-tools.factory.ts` (upstream-edit)
- `packages/twenty-server/src/database/commands/upgrade-version-command/instance-commands.constant.ts` (upstream-edit)
- `packages/twenty-client-sdk/src/metadata/generated/schema.ts` (upstream-edit)
- `packages/twenty-client-sdk/src/metadata/generated/schema.graphql` (upstream-edit)
- `packages/twenty-server/src/database/commands/upgrade-version-command/fork-travis/fork-instance-command-fast-1786904400000-add-relations-view-type.ts` (new-file)
- `packages/twenty-front/src/modules/object-record/record-index/components/RecordIndexRelationsContainer.tsx` (new-file)
- `packages/twenty-front/src/modules/object-record/record-relations/**` (new-file)

Type: upstream-edit for single-source enum/picker/query/wiring files; new-file for the fork migration and the relations module.
Why: Fifth view type `RELATIONS` (SPEC-TWENTY-RELATIONS-VIEW-1.0). Modelled on upstream LIST (PR #23829). No feature flag.
Could this be a new file instead: no for the enum/layout/picker/query/wiring files, because each is a single source of truth; yes for `record-relations/` and the fork-local migration, and those are new files.
Upstream equivalent: none

