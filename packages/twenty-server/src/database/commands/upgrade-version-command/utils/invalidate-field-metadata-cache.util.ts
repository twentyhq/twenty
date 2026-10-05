import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { getMetadataSerializedRelationNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-serialized-relation-names.util';
import { type WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

export const invalidateFieldMetadataCache = async ({
  workspaceId,
  workspaceMigrationRunnerService,
}: {
  workspaceId: string;
  workspaceMigrationRunnerService: WorkspaceMigrationRunnerService;
}): Promise<void> => {
  const fieldMetadataRelatedNames = [
    'fieldMetadata',
    ...getMetadataRelatedMetadataNames('fieldMetadata'),
    ...getMetadataSerializedRelationNames('fieldMetadata'),
    'index',
  ] as const;

  await workspaceMigrationRunnerService.invalidateCache({
    allFlatEntityMapsKeys: [
      ...new Set(fieldMetadataRelatedNames.map(getMetadataFlatEntityMapsKey)),
    ],
    workspaceId,
  });
};
