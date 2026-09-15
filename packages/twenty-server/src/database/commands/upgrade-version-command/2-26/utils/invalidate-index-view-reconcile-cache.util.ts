import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { type WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

export const invalidateIndexViewReconcileCache = async ({
  workspaceId,
  workspaceMigrationRunnerService,
}: {
  workspaceId: string;
  workspaceMigrationRunnerService: WorkspaceMigrationRunnerService;
}): Promise<void> => {
  const reconciledMetadataRelatedNames = [
    'view',
    ...getMetadataRelatedMetadataNames('view'),
    'viewField',
    ...getMetadataRelatedMetadataNames('viewField'),
    'pageLayoutWidget',
  ] as const;

  await workspaceMigrationRunnerService.invalidateCache({
    allFlatEntityMapsKeys: [
      ...new Set(
        reconciledMetadataRelatedNames.map(getMetadataFlatEntityMapsKey),
      ),
    ],
    workspaceId,
  });
};
