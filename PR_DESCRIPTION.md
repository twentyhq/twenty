# Backfill application package files for custom and standard apps

- Backfill `package.json` / `yarn.lock` (and related fields) for existing workspaces; new standard/custom apps get default dependency files.
- **Upgrade command** `upgrade:1-17:backfill-application-package-files`: standard/custom apps → default files; other apps → from logic function layer. Supports `--dryRun`.
- Default package files under `application/constants/default-package-files/`; util with hardcoded checksums (comment on how to regenerate).
- **Workspace creation**: create workspace with `workspaceCustomApplicationId` first, then create application (enables same-transaction insert). Migration makes workspace/application/file FKs deferrable.
- **createWorkspaceCustomApplication** accepts `applicationId`; sign-in-up and dev seeder updated to pass it.
- New **FileFolder.Dependencies** for app dependency files; **writeFile_v2** accepts optional `queryRunner` for transactional writes.
- Application sync find-or-create: create app with default package fields and upload default files (flow simplified).
- Parse util capped at 100k regex matches to avoid infinite loop on malformed yarn.lock.
