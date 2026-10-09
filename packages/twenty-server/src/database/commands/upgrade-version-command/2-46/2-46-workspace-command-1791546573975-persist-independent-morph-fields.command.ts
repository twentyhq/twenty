import { type AllMetadataName } from 'twenty-shared/metadata';
import { Command } from 'nest-commander';
import { isDefined, isMorphRelationGroup } from 'twenty-shared/utils';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildIndependentMorphFields } from 'src/database/commands/upgrade-version-command/2-46/utils/build-independent-morph-fields.util';
import { buildMorphFieldReferenceUpdates } from 'src/database/commands/upgrade-version-command/2-46/utils/build-morph-field-reference-updates.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type AllFlatEntityOperationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.46.0', 1791546573975)
@Command({
  name: 'upgrade:2-46:persist-independent-morph-fields',
  description: 'Give morph fields an identity independent of their targets',
})
export class PersistIndependentMorphFieldsCommand extends ProvisionedWorkspaceCommandRunner {
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

  async up(args: RunOnWorkspaceArgs): Promise<void> {
    const { workspaceId, options } = args;
    const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatObjectMetadataMaps',
      ]);
    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const { allFlatEntityMaps: standardMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
        now: new Date().toISOString(),
      });
    const fieldsToCreate = buildIndependentMorphFields({
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
      standardFlatFieldMetadataMaps: standardMaps.flatFieldMetadataMaps,
    });
    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Creating ${fieldsToCreate.length} independent morph fields for workspace ${workspaceId}`,
    );
    if (options.dryRun) return;

    await this.runOperations(workspaceId, {
      fieldMetadata: {
        flatEntityToCreate: fieldsToCreate,
        flatEntityToUpdate: [],
        flatEntityToDelete: [],
      },
    });
    await this.moveReferences(workspaceId, 'up');
  }

  async down({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Restoring target-owned morph fields for workspace ${workspaceId}`,
      );
      return;
    }
    await this.moveReferences(workspaceId, 'down');
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);
    const groups = Object.values(flatFieldMetadataMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(isMorphRelationGroup);
    await this.runOperations(workspaceId, {
      fieldMetadata: {
        flatEntityToCreate: [],
        flatEntityToUpdate: [],
        flatEntityToDelete: groups,
      },
    });
  }

  private async moveReferences(
    workspaceId: string,
    direction: 'up' | 'down',
  ): Promise<void> {
    const maps = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatFieldMetadataMaps',
      'flatViewFieldMaps',
      'flatFieldPermissionMaps',
      'flatPageLayoutWidgetMaps',
    ]);
    await this.runOperations(
      workspaceId,
      buildMorphFieldReferenceUpdates({ ...maps, direction }),
    );
  }

  private async runOperations(
    workspaceId: string,
    operations: AllFlatEntityOperationByMetadataName,
  ): Promise<void> {
    const applicationIdentifiers = new Set(
      Object.values(operations).flatMap((operation) =>
        Object.values(operation)
          .flat()
          .map((entity) => entity.applicationUniversalIdentifier),
      ),
    );
    for (const applicationUniversalIdentifier of applicationIdentifiers) {
      const applicationOperations = Object.fromEntries(
        Object.entries(operations).map(([metadataName, operation]) => [
          metadataName,
          Object.fromEntries(
            Object.entries(operation).map(([operationName, entities]) => [
              operationName,
              entities.filter(
                (entity: MetadataUniversalFlatEntity<AllMetadataName>) =>
                  entity.applicationUniversalIdentifier ===
                  applicationUniversalIdentifier,
              ),
            ]),
          ),
        ]),
      ) as AllFlatEntityOperationByMetadataName;
      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
          {
            workspaceId,
            isSystemBuild: true,
            applicationUniversalIdentifier,
            allFlatEntityOperationByMetadataName: applicationOperations,
          },
        );
      if (result.status === 'fail')
        throw new WorkspaceMigrationBuilderException(
          result,
          'Failed to migrate independent morph fields',
        );
    }
  }
}
