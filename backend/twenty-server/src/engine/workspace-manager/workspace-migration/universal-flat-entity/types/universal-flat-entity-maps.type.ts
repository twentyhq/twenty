import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type UniversalSyncableFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatEntityMaps<
  T extends SyncableFlatEntity | UniversalSyncableFlatEntity,
> = {
  byUniversalIdentifier: Partial<Record<string, T>>;
};
