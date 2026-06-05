import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { enrichSyncActionsWithFlatEntityInfo } from 'src/engine/core-modules/application/application-manifest/utils/enrich-sync-actions-with-flat-entity-info.util';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';

const OBJECT_KEY = getMetadataFlatEntityMapsKey(ALL_METADATA_NAME.objectMetadata);

const buildMapsWith = (
  entities: { universalIdentifier: string; nameSingular: string }[],
): AllFlatEntityMaps => {
  const maps = createEmptyAllFlatEntityMaps();
  const objectMaps = maps[OBJECT_KEY] as unknown as {
    byUniversalIdentifier: Record<string, unknown>;
  };

  for (const entity of entities) {
    objectMaps.byUniversalIdentifier[entity.universalIdentifier] = entity;
  }

  return maps;
};

describe('enrichSyncActionsWithFlatEntityInfo', () => {
  it('leaves create actions untouched (they already carry flatEntity)', () => {
    const createAction = {
      type: 'create',
      metadataName: 'objectMetadata',
      flatEntity: { universalIdentifier: 'c1', nameSingular: 'rocket' },
    } as unknown as AllUniversalWorkspaceMigrationAction;

    const [enriched] = enrichSyncActionsWithFlatEntityInfo({
      actions: [createAction],
      fromAllFlatEntityMaps: buildMapsWith([]),
      toAllUniversalFlatEntityMaps: buildMapsWith([]),
    });

    expect(enriched).toBe(createAction);
  });

  it('attaches the manifest flatEntity to update actions', () => {
    const updateAction = {
      type: 'update',
      metadataName: 'objectMetadata',
      universalIdentifier: 'u1',
      update: {},
    } as unknown as AllUniversalWorkspaceMigrationAction;

    const [enriched] = enrichSyncActionsWithFlatEntityInfo({
      actions: [updateAction],
      fromAllFlatEntityMaps: buildMapsWith([]),
      toAllUniversalFlatEntityMaps: buildMapsWith([
        { universalIdentifier: 'u1', nameSingular: 'satellite' },
      ]),
    });

    expect(enriched).toMatchObject({
      type: 'update',
      metadataName: 'objectMetadata',
      universalIdentifier: 'u1',
      flatEntity: { universalIdentifier: 'u1', nameSingular: 'satellite' },
    });
  });

  it('attaches the existing flatEntity to delete actions', () => {
    const deleteAction = {
      type: 'delete',
      metadataName: 'objectMetadata',
      universalIdentifier: 'd1',
    } as unknown as AllUniversalWorkspaceMigrationAction;

    const [enriched] = enrichSyncActionsWithFlatEntityInfo({
      actions: [deleteAction],
      fromAllFlatEntityMaps: buildMapsWith([
        { universalIdentifier: 'd1', nameSingular: 'legacy' },
      ]),
      toAllUniversalFlatEntityMaps: buildMapsWith([]),
    });

    expect(enriched).toMatchObject({
      type: 'delete',
      metadataName: 'objectMetadata',
      universalIdentifier: 'd1',
      flatEntity: { universalIdentifier: 'd1', nameSingular: 'legacy' },
    });
  });

  it('leaves the action untouched when the entity is not found in the maps', () => {
    const deleteAction = {
      type: 'delete',
      metadataName: 'objectMetadata',
      universalIdentifier: 'missing',
    } as unknown as AllUniversalWorkspaceMigrationAction;

    const [enriched] = enrichSyncActionsWithFlatEntityInfo({
      actions: [deleteAction],
      fromAllFlatEntityMaps: buildMapsWith([]),
      toAllUniversalFlatEntityMaps: buildMapsWith([]),
    });

    expect(enriched).toBe(deleteAction);
  });
});
