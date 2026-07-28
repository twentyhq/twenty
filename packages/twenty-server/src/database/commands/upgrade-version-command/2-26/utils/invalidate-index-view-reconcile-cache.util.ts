import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { type WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

// Other flat maps embed the reconciled universal identifiers: parents
// aggregate them (objectMetadata.viewUniversalIdentifiers,
// fieldMetadata.viewFieldUniversalIdentifiers), children resolve their parent
// universal foreign key (view fields, filters, sorts, groups), and
// flatPageLayoutWidget.universalConfiguration resolves the configuration view
// PK to its universal identifier at cache-build time (not covered by the
// FK-based related-names helper).
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
