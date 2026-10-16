import { Command } from 'nest-commander';
import { isDefined, isMorphRelationHead } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildMissingMorphRelationHeads } from 'src/database/commands/upgrade-version-command/2-48/utils/build-missing-morph-relation-heads.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

@RegisteredWorkspaceCommand('2.48.0', 1791998420300)
@Command({
  name: 'upgrade:2-48:backfill-morph-relation-heads',
  description:
    'Create the head row of every morph relation field created before heads existed',
})
export class BackfillMorphRelationHeadsCommand extends ProvisionedWorkspaceCommandRunner {
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
    const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatObjectMetadataMaps',
      ]);

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const { heads, skipped } = buildMissingMorphRelationHeads({
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
      standardFlatFieldMetadataMaps:
        standardAllFlatEntityMaps.flatFieldMetadataMaps,
    });

    for (const { morphId, reason } of skipped) {
      this.logger.warn(
        `Workspace ${workspaceId}: no head for morph relation ${morphId}, ${reason}`,
      );
    }

    if (heads.length === 0) {
      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: would create ${heads.length} morph relation head(s)`,
      );

      return;
    }

    await this.runPerApplication({
      workspaceId,
      twentyStandardApplicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
      heads,
      operation: 'create',
    });
  }

  async down({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const heads = Object.values(flatFieldMetadataMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(isMorphRelationHead);

    if (heads.length === 0) {
      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: would delete ${heads.length} morph relation head(s)`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    await this.runPerApplication({
      workspaceId,
      twentyStandardApplicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
      heads,
      operation: 'delete',
    });
  }

  private async runPerApplication({
    workspaceId,
    twentyStandardApplicationUniversalIdentifier,
    heads,
    operation,
  }: {
    workspaceId: string;
    twentyStandardApplicationUniversalIdentifier: string;
    heads: UniversalFlatFieldMetadata[];
    operation: 'create' | 'delete';
  }): Promise<void> {
    const headsByApplication = new Map<string, UniversalFlatFieldMetadata[]>();

    for (const head of heads) {
      headsByApplication.set(head.applicationUniversalIdentifier, [
        ...(headsByApplication.get(head.applicationUniversalIdentifier) ?? []),
        head,
      ]);
    }

    for (const [
      applicationUniversalIdentifier,
      applicationHeads,
    ] of headsByApplication) {
      const args = {
        isSystemBuild: true,
        workspaceId,
        applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          fieldMetadata: {
            flatEntityToCreate: operation === 'create' ? applicationHeads : [],
            flatEntityToDelete: operation === 'delete' ? applicationHeads : [],
            flatEntityToUpdate: [],
          },
        },
      };

      const result =
        applicationUniversalIdentifier ===
        twentyStandardApplicationUniversalIdentifier
          ? await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
              args,
            )
          : await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
              args,
            );

      if (result.status === 'fail') {
        throw new WorkspaceMigrationBuilderException(
          result,
          `Failed to ${operation} morph relation heads of application ${applicationUniversalIdentifier} in workspace ${workspaceId}`,
        );
      }
    }
  }
}
