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
    // Not part of view's declared relations but cascade-deleted by the
    // database when a soft-deleted view holding a reconciled identifier is
    // hard-deleted (navigationMenuItem.viewId is ON DELETE CASCADE).
    'navigationMenuItem',
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
