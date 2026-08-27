import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

@RegisteredWorkspaceCommand('2.36.0', 1787751565453)
@Command({
  name: 'upgrade:2-36:sync-standard-field-ui-editable-flags',
  description:
    'Re-sync isUIEditable on standard fields from the standard-application definitions',
})
export class SyncStandardFieldUiEditableFlagsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatFieldMetadataMaps: existingFlatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const fieldsToUpdate = Object.values(
      standardAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .map((standardField) => {
        const existingField =
          existingFlatFieldMetadataMaps.byUniversalIdentifier[
            standardField.universalIdentifier
          ];

        if (
          !isDefined(existingField) ||
          existingField.isUIEditable === standardField.isUIEditable
        ) {
          return undefined;
        }

        return {
          id: existingField.id,
          isUIEditable: standardField.isUIEditable,
        };
      })
      .filter(isDefined);

    if (fieldsToUpdate.length === 0) {
      this.logger.log(
        `Standard field UI editable flags already up to date for workspace ${workspaceId}`,
      );

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would sync isUIEditable on ${fieldsToUpdate.length} standard field(s) for workspace ${workspaceId}`,
      );

      return;
    }

    const fieldIdsToSetEditable = fieldsToUpdate
      .filter((field) => field.isUIEditable)
      .map((field) => field.id);
    const fieldIdsToSetNonEditable = fieldsToUpdate
      .filter((field) => !field.isUIEditable)
      .map((field) => field.id);

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (fieldIdsToSetEditable.length > 0) {
        await queryRunner.query(
          `UPDATE "core"."fieldMetadata" SET "isUIEditable" = true, "updatedAt" = now() WHERE "id" = ANY($1)`,
          [fieldIdsToSetEditable],
        );
      }

      if (fieldIdsToSetNonEditable.length > 0) {
        await queryRunner.query(
          `UPDATE "core"."fieldMetadata" SET "isUIEditable" = false, "updatedAt" = now() WHERE "id" = ANY($1)`,
          [fieldIdsToSetNonEditable],
        );
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner.release();
    }

    try {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);
    } catch (cacheError) {
      this.logger.warn(
        `Synced isUIEditable for workspace ${workspaceId} but failed to invalidate the metadata cache: ${
          cacheError instanceof Error ? cacheError.message : String(cacheError)
        }`,
      );
    }

    this.logger.log(
      `Successfully synced isUIEditable on ${fieldsToUpdate.length} standard field(s) for workspace ${workspaceId}`,
    );
  }
}
