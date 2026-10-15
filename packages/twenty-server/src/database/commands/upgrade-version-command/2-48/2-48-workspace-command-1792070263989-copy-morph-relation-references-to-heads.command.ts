import { Command } from 'nest-commander';
import { isDefined, isMorphRelationHead } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildMorphRelationHeadFieldPermissionCopies } from 'src/database/commands/upgrade-version-command/2-48/utils/build-morph-relation-head-field-permission-copies.util';
import { buildMorphRelationHeadViewFieldCopies } from 'src/database/commands/upgrade-version-command/2-48/utils/build-morph-relation-head-view-field-copies.util';
import { buildMorphRelationHeadViewFilterCopies } from 'src/database/commands/upgrade-version-command/2-48/utils/build-morph-relation-head-view-filter-copies.util';
import { computeMorphRelationHeadByRepresentativeId } from 'src/database/commands/upgrade-version-command/2-48/utils/compute-morph-relation-head-by-representative-id.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatFieldPermission } from 'src/engine/metadata-modules/flat-field-permission/types/flat-field-permission.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

type MorphRelationHeadReferences = {
  viewFields: FlatViewField[];
  viewFilters: FlatViewFilter[];
  fieldPermissions: FlatFieldPermission[];
};

@RegisteredWorkspaceCommand('2.48.0', 1792070263989)
@Command({
  name: 'upgrade:2-48:copy-morph-relation-references-to-heads',
  description:
    'Copy the view fields, filters and field permissions of each morph relation onto its head',
})
export class CopyMorphRelationReferencesToHeadsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const {
      flatFieldMetadataMaps,
      flatViewFieldMaps,
      flatViewFieldGroupMaps,
      flatViewFilterMaps,
      flatFieldPermissionMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatFieldMetadataMaps',
      'flatViewFieldMaps',
      'flatViewFieldGroupMaps',
      'flatViewFilterMaps',
      'flatFieldPermissionMaps',
    ]);

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const workspaceCustomApplicationUniversalIdentifier =
      workspaceCustomFlatApplication.universalIdentifier;

    const headByRepresentativeId =
      computeMorphRelationHeadByRepresentativeId(flatFieldMetadataMaps);

    const copies: MorphRelationHeadReferences = {
      viewFields: buildMorphRelationHeadViewFieldCopies({
        headByRepresentativeId,
        workspaceCustomApplicationUniversalIdentifier,
        flatViewFieldMaps,
        flatViewFieldGroupMaps,
      }),
      viewFilters: buildMorphRelationHeadViewFilterCopies({
        headByRepresentativeId,
        workspaceCustomApplicationUniversalIdentifier,
        flatViewFilterMaps,
      }),
      fieldPermissions: buildMorphRelationHeadFieldPermissionCopies({
        headByRepresentativeId,
        flatFieldPermissionMaps,
      }),
    };

    await this.runPerApplication({
      workspaceId,
      dryRun: options.dryRun,
      references: copies,
      operation: 'create',
    });
  }

  async down({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const {
      flatFieldMetadataMaps,
      flatViewFieldMaps,
      flatViewFilterMaps,
      flatFieldPermissionMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatFieldMetadataMaps',
      'flatViewFieldMaps',
      'flatViewFilterMaps',
      'flatFieldPermissionMaps',
    ]);

    const headIds = new Set(
      Object.values(flatFieldMetadataMaps.byUniversalIdentifier)
        .filter(isDefined)
        .filter(isMorphRelationHead)
        .map(({ id }) => id),
    );
    const isHeadId = (fieldMetadataId: string | null | undefined) =>
      isDefined(fieldMetadataId) && headIds.has(fieldMetadataId);

    await this.runPerApplication({
      workspaceId,
      dryRun: options.dryRun,
      operation: 'delete',
      references: {
        viewFields: Object.values(flatViewFieldMaps.byUniversalIdentifier)
          .filter(isDefined)
          .filter((viewField) => isHeadId(viewField.fieldMetadataId)),
        viewFilters: Object.values(flatViewFilterMaps.byUniversalIdentifier)
          .filter(isDefined)
          .filter(
            (viewFilter) =>
              isHeadId(viewFilter.fieldMetadataId) ||
              isHeadId(viewFilter.relationTargetFieldMetadataId),
          ),
        fieldPermissions: Object.values(
          flatFieldPermissionMaps.byUniversalIdentifier,
        )
          .filter(isDefined)
          .filter((fieldPermission) =>
            isHeadId(fieldPermission.fieldMetadataId),
          ),
      },
    });
  }

  private async runPerApplication({
    workspaceId,
    dryRun,
    references,
    operation,
  }: {
    workspaceId: string;
    dryRun?: boolean;
    references: MorphRelationHeadReferences;
    operation: 'create' | 'delete';
  }): Promise<void> {
    const { viewFields, viewFilters, fieldPermissions } = references;
    const referenceCount =
      viewFields.length + viewFilters.length + fieldPermissions.length;

    if (referenceCount === 0) {
      return;
    }

    if (dryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: would ${operation} ${viewFields.length} view field(s), ${viewFilters.length} view filter(s) and ${fieldPermissions.length} field permission(s) on morph relation heads`,
      );

      return;
    }

    const applicationUniversalIdentifiers = new Set(
      [...viewFields, ...viewFilters, ...fieldPermissions].map(
        ({ applicationUniversalIdentifier }) => applicationUniversalIdentifier,
      ),
    );

    for (const applicationUniversalIdentifier of applicationUniversalIdentifiers) {
      const ownedBy = <
        TEntity extends { applicationUniversalIdentifier: string },
      >(
        entities: TEntity[],
      ) => {
        const ownedEntities = entities.filter(
          (entity) =>
            entity.applicationUniversalIdentifier ===
            applicationUniversalIdentifier,
        );

        return {
          flatEntityToCreate: operation === 'create' ? ownedEntities : [],
          flatEntityToUpdate: [],
          flatEntityToDelete: operation === 'delete' ? ownedEntities : [],
        };
      };

      const args = {
        workspaceId,
        isSystemBuild: true,
        applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          viewField: ownedBy(viewFields),
          viewFilter: ownedBy(viewFilters),
          fieldPermission: ownedBy(fieldPermissions),
        },
      };

      const result =
        applicationUniversalIdentifier ===
        TWENTY_STANDARD_APPLICATION.universalIdentifier
          ? await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
              args,
            )
          : await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
              args,
            );

      if (result.status === 'fail') {
        throw new WorkspaceMigrationBuilderException(
          result,
          `Failed to ${operation} morph relation head references of application ${applicationUniversalIdentifier} in workspace ${workspaceId}`,
        );
      }
    }
  }
}
