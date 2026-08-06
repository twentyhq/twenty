import { Command } from 'nest-commander';

import { ViewFilterOperand, ViewKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { findFlatFieldMetadataByName } from 'src/database/commands/upgrade-version-command/2-27/utils/find-flat-field-metadata-by-name.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const CONNECTION_OBJECT_NAME_SINGULAR = 'connection';
const IS_RECIPROCAL_FIELD_NAME = 'isReciprocal';

// Boolean filters are stored as the string the filter dropdown produces
const FALSE_FILTER_VALUE = 'false';

@RegisteredWorkspaceCommand('2.27.0', 1785850000000)
@Command({
  name: 'upgrade:2-27:hide-reciprocals-from-connections-view',
  description:
    'Filter generated reverses out of the connections index view, so the list keeps showing each relationship once now that every one is stored in both directions.',
})
export class HideReciprocalsFromConnectionsViewCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatViewMaps,
      flatViewFilterMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatViewMaps',
      'flatViewFilterMaps',
    ]);

    const isReciprocalFlatFieldMetadata = findFlatFieldMetadataByName({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectNameSingular: CONNECTION_OBJECT_NAME_SINGULAR,
      fieldName: IS_RECIPROCAL_FIELD_NAME,
    });

    if (!isDefined(isReciprocalFlatFieldMetadata)) {
      this.logger.log(
        `No connection.isReciprocal field for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const connectionFlatObjectMetadata = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    ).find(
      (candidate) => candidate?.nameSingular === CONNECTION_OBJECT_NAME_SINGULAR,
    );

    if (!isDefined(connectionFlatObjectMetadata)) {
      this.logger.log(
        `No connection object for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const connectionIndexFlatView =
      connectionFlatObjectMetadata.viewUniversalIdentifiers
        .map(
          (viewUniversalIdentifier) =>
            flatViewMaps.byUniversalIdentifier[viewUniversalIdentifier],
        )
        .filter(isDefined)
        .find(
          (flatView) =>
            flatView.key === ViewKey.INDEX && !isDefined(flatView.deletedAt),
        );

    if (!isDefined(connectionIndexFlatView)) {
      this.logger.warn(
        `No connections index view for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const hasExistingFilter = Object.values(
      flatViewFilterMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .some(
        (flatViewFilter) =>
          flatViewFilter.viewId === connectionIndexFlatView.id &&
          flatViewFilter.fieldMetadataId === isReciprocalFlatFieldMetadata.id &&
          !isDefined(flatViewFilter.deletedAt),
      );

    if (hasExistingFilter) {
      this.logger.log(
        `Connections index view already filters reciprocals for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Filtering reciprocals out of the connections index view for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { viewUniversalIdentifier, fieldMetadataUniversalIdentifier } =
      resolveEntityRelationUniversalIdentifiers({
        metadataName: 'viewFilter',
        foreignKeyValues: {
          viewId: connectionIndexFlatView.id,
          fieldMetadataId: isReciprocalFlatFieldMetadata.id,
        },
        flatEntityMaps: {
          flatViewMaps,
          flatFieldMetadataMaps,
        },
      });

    const now = new Date().toISOString();
    const flatViewFilterToCreate = {
      id: v4(),
      universalIdentifier: v4(),
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      applicationId: workspaceCustomFlatApplication.id,
      workspaceId,
      viewUniversalIdentifier,
      fieldMetadataUniversalIdentifier,
      viewId: connectionIndexFlatView.id,
      fieldMetadataId: isReciprocalFlatFieldMetadata.id,
      operand: ViewFilterOperand.IS,
      value: FALSE_FILTER_VALUE,
      viewFilterGroupId: null,
      positionInViewFilterGroup: null,
      subFieldName: null,
      relationTargetFieldMetadataId: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    } as unknown as FlatViewFilter;

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
          workspaceId,
          allFlatEntityOperationByMetadataName: {
            viewFilter: {
              flatEntityToCreate: [flatViewFilterToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new Error(
        `Failed to filter reciprocals out of the connections index view for workspace ${workspaceId}: ${JSON.stringify(
          result,
          null,
          2,
        )}`,
      );
    }

    this.logger.log(
      `Filtered reciprocals out of the connections index view for workspace ${workspaceId}`,
    );
  }
}
