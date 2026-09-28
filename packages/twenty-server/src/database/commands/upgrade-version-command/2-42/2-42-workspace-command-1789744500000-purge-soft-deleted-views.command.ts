import { Command } from 'nest-commander';

import { ViewType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.42.0', 1789744500000)
@Command({
  name: 'upgrade:2-42:purge-soft-deleted-views',
  description:
    'Hard-delete soft-deleted views, view fields, view field groups, view filters, view filter groups, view groups and view sorts',
})
export class PurgeSoftDeletedViewsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceCacheService: WorkspaceCacheService,
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
      flatViewMaps,
      flatViewFieldMaps,
      flatViewFieldGroupMaps,
      flatViewFilterMaps,
      flatViewFilterGroupMaps,
      flatViewGroupMaps,
      flatViewSortMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatViewMaps',
      'flatViewFieldMaps',
      'flatViewFieldGroupMaps',
      'flatViewFilterMaps',
      'flatViewFilterGroupMaps',
      'flatViewGroupMaps',
      'flatViewSortMaps',
    ]);

    const flatViews = Object.values(flatViewMaps.byUniversalIdentifier).filter(
      isDefined,
    );

    const objectMetadataIdsWithRemainingView = new Set(
      flatViews
        .filter((flatView) => !isDefined(flatView.deletedAt))
        .map((flatView) => flatView.objectMetadataId),
    );

    const softDeletedViews = flatViews.filter((flatView) =>
      isDefined(flatView.deletedAt),
    );

    const viewsToDelete = softDeletedViews.filter((flatView) =>
      objectMetadataIdsWithRemainingView.has(flatView.objectMetadataId),
    );

    const skippedViewCount = softDeletedViews.length - viewsToDelete.length;

    if (skippedViewCount > 0) {
      this.logger.warn(
        `Skipping ${skippedViewCount} soft-deleted view(s) that are the last view of their object in workspace ${workspaceId}`,
      );
    }

    const deletedViewIds = new Set(
      viewsToDelete.map((flatView) => flatView.id),
    );

    const isSoftDeletedOutsideDeletedView = (flatEntity: {
      deletedAt?: string | null;
      viewId: string;
    }) =>
      isDefined(flatEntity.deletedAt) && !deletedViewIds.has(flatEntity.viewId);

    const hasSoftDeletedViewFilterGroupInChain = (
      viewFilterGroupId: string | null | undefined,
    ): boolean => {
      const visitedViewFilterGroupIds = new Set<string>();
      let currentViewFilterGroupId = viewFilterGroupId;

      while (
        isDefined(currentViewFilterGroupId) &&
        !visitedViewFilterGroupIds.has(currentViewFilterGroupId)
      ) {
        visitedViewFilterGroupIds.add(currentViewFilterGroupId);

        const flatViewFilterGroup = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: currentViewFilterGroupId,
          flatEntityMaps: flatViewFilterGroupMaps,
        });

        if (!isDefined(flatViewFilterGroup)) {
          return false;
        }

        if (isDefined(flatViewFilterGroup.deletedAt)) {
          return true;
        }

        currentViewFilterGroupId = flatViewFilterGroup.parentViewFilterGroupId;
      }

      return false;
    };

    const remainingFlatViewById = new Map(
      flatViews
        .filter((flatView) => !deletedViewIds.has(flatView.id))
        .map((flatView) => [flatView.id, flatView]),
    );

    const flatViewFields = Object.values(
      flatViewFieldMaps.byUniversalIdentifier,
    ).filter(isDefined);

    const isOnlyLabelIdentifierViewFieldOfItsView = (
      flatViewField: (typeof flatViewFields)[number],
    ): boolean => {
      const flatView = remainingFlatViewById.get(flatViewField.viewId);

      if (!isDefined(flatView) || flatView.type === ViewType.FIELDS_WIDGET) {
        return false;
      }

      const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: flatView.objectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      });

      if (
        !isDefined(flatObjectMetadata) ||
        flatObjectMetadata.labelIdentifierFieldMetadataId !==
          flatViewField.fieldMetadataId
      ) {
        return false;
      }

      return !flatViewFields.some(
        (otherFlatViewField) =>
          otherFlatViewField.id !== flatViewField.id &&
          otherFlatViewField.viewId === flatViewField.viewId &&
          otherFlatViewField.fieldMetadataId ===
            flatViewField.fieldMetadataId &&
          !isDefined(otherFlatViewField.deletedAt),
      );
    };

    const softDeletedViewFields = flatViewFields.filter(
      isSoftDeletedOutsideDeletedView,
    );

    const viewFieldsToDelete = softDeletedViewFields.filter(
      (flatViewField) =>
        !isOnlyLabelIdentifierViewFieldOfItsView(flatViewField),
    );

    const skippedViewFieldCount =
      softDeletedViewFields.length - viewFieldsToDelete.length;

    if (skippedViewFieldCount > 0) {
      this.logger.warn(
        `Skipping ${skippedViewFieldCount} soft-deleted view field(s) that are the only label identifier view field of their view in workspace ${workspaceId}`,
      );
    }
    const viewFieldGroupsToDelete = Object.values(
      flatViewFieldGroupMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(isSoftDeletedOutsideDeletedView);
    const viewFilterGroupsToDelete = Object.values(
      flatViewFilterGroupMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (flatViewFilterGroup) =>
          isSoftDeletedOutsideDeletedView(flatViewFilterGroup) &&
          !hasSoftDeletedViewFilterGroupInChain(
            flatViewFilterGroup.parentViewFilterGroupId,
          ),
      );
    const viewFiltersToDelete = Object.values(
      flatViewFilterMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (flatViewFilter) =>
          isSoftDeletedOutsideDeletedView(flatViewFilter) &&
          !hasSoftDeletedViewFilterGroupInChain(
            flatViewFilter.viewFilterGroupId,
          ),
      );
    const viewGroupsToDelete = Object.values(
      flatViewGroupMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(isSoftDeletedOutsideDeletedView);
    const viewSortsToDelete = Object.values(
      flatViewSortMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(isSoftDeletedOutsideDeletedView);

    const rowToDeleteCount =
      viewsToDelete.length +
      viewFieldsToDelete.length +
      viewFieldGroupsToDelete.length +
      viewFilterGroupsToDelete.length +
      viewFiltersToDelete.length +
      viewGroupsToDelete.length +
      viewSortsToDelete.length;

    if (rowToDeleteCount === 0) {
      this.logger.log(
        `No soft-deleted view or view child to purge for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const purgeSummary = `${viewsToDelete.length} view(s), ${viewFieldsToDelete.length} view field(s), ${viewFieldGroupsToDelete.length} view field group(s), ${viewFiltersToDelete.length} view filter(s), ${viewFilterGroupsToDelete.length} view filter group(s), ${viewGroupsToDelete.length} view group(s) and ${viewSortsToDelete.length} view sort(s)`;

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Purging ${purgeSummary} for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    // Purged rows can belong to any application; this is only the runner's existence gate and the
    // builder's dependency-slice anchor, not a scope filter. One bundled build also keeps children
    // deleted before their view, which one build per application would not guarantee.
    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          isSystemBuild: true,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
          workspaceId,
          allFlatEntityOperationByMetadataName: {
            view: {
              flatEntityToCreate: [],
              flatEntityToDelete: viewsToDelete,
              flatEntityToUpdate: [],
            },
            viewFieldGroup: {
              flatEntityToCreate: [],
              flatEntityToDelete: viewFieldGroupsToDelete,
              flatEntityToUpdate: [],
            },
            viewField: {
              flatEntityToCreate: [],
              flatEntityToDelete: viewFieldsToDelete,
              flatEntityToUpdate: [],
            },
            viewFilterGroup: {
              flatEntityToCreate: [],
              flatEntityToDelete: viewFilterGroupsToDelete,
              flatEntityToUpdate: [],
            },
            viewFilter: {
              flatEntityToCreate: [],
              flatEntityToDelete: viewFiltersToDelete,
              flatEntityToUpdate: [],
            },
            viewGroup: {
              flatEntityToCreate: [],
              flatEntityToDelete: viewGroupsToDelete,
              flatEntityToUpdate: [],
            },
            viewSort: {
              flatEntityToCreate: [],
              flatEntityToDelete: viewSortsToDelete,
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(validateAndBuildResult);
    }

    this.logger.log(`Purged ${purgeSummary} for workspace ${workspaceId}`);
  }
}
