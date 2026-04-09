import { type AllMetadataName } from 'twenty-shared/metadata';

import { type UniversalFlatEntityUpdate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-update.type';
import { type WORKSPACE_MIGRATION_ACTION_TYPE } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/constants/workspace-migration-action-type.constant';

export type BaseUniversalUpdateWorkspaceMigrationAction<
  T extends AllMetadataName,
> = {
  type: typeof WORKSPACE_MIGRATION_ACTION_TYPE.update;
  metadataName: T;
  universalIdentifier: string;
  update: UniversalFlatEntityUpdate<T>;
};
