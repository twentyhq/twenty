import { type WorkspaceMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration.type';

export type ApplicationManifestSyncResult = {
  workspaceMigration: WorkspaceMigration;
  hasSchemaMetadataChanged: boolean;
  cascadeDeletionParentByUniversalIdentifier: Record<string, string>;
};
