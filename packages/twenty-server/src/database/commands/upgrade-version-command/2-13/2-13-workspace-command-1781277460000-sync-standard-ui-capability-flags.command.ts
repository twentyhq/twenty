import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

// Re-syncs the UI capability flags of standard objects and fields with their
// standard-application definitions. Covers two cases the rename instance
// command cannot reach:
// - isUICreatable is a new column (default true) and workflowRun,
//   workflowVersion and workspaceMember must become non-creatable; the
//   twenty-standard application is not re-synced on existing workspaces.
// - standard fields created by pre-2.13 workspace upgrade commands during a
//   cross-version upgrade lose their isUIEditable: false value (the column is
//   hidden until the rename instance command has run), so they would
//   otherwise stay editable after the rename backfill.
@RegisteredWorkspaceCommand('2.13.0', 1781277460000)
@Command({
  name: 'upgrade:2-13:sync-standard-ui-capability-flags',
  description:
    'Re-sync isUICreatable and isUIEditable on standard objects and isUIEditable on standard fields from the standard-application definitions',
})
export class SyncStandardUiCapabilityFlagsCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Syncing standard UI capability flags for workspace ${workspaceId}`,
    );

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const {
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
    ]);

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const objectsToUpdate = Object.values(
      standardAllFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .map((standardObject) => {
        const existingObject =
          existingFlatObjectMetadataMaps.byUniversalIdentifier[
            standardObject.universalIdentifier
          ];

        if (
          !isDefined(existingObject) ||
          (existingObject.isUICreatable === standardObject.isUICreatable &&
            existingObject.isUIEditable === standardObject.isUIEditable)
        ) {
          return undefined;
        }

        return {
          ...existingObject,
          isUICreatable: standardObject.isUICreatable,
          isUIEditable: standardObject.isUIEditable,
          updatedAt: new Date().toISOString(),
        };
      })
      .filter(isDefined);

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
          ...existingField,
          isUIEditable: standardField.isUIEditable,
          updatedAt: new Date().toISOString(),
        };
      })
      .filter(isDefined);

    if (objectsToUpdate.length === 0 && fieldsToUpdate.length === 0) {
      this.logger.log(
        `Standard UI capability flags already up to date for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `Found ${objectsToUpdate.length} standard object(s) and ${fieldsToUpdate.length} standard field(s) with drifted UI capability flags for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would sync UI capability flags on ${objectsToUpdate.length} standard object(s) and ${fieldsToUpdate.length} standard field(s) for workspace ${workspaceId}`,
      );

      return;
    }

    // isUIEditable/isUICreatable are UI-affordance flags stored directly on
    // core.objectMetadata/core.fieldMetadata — changing them needs no
    // workspace-schema migration. We write them straight to the metadata
    // tables instead of going through validateBuildAndRunWorkspaceMigration:
    // that pipeline enforces user-facing mutation guards (system-field and
    // relation-field property allow-lists) that reject this trusted system
    // backfill on cross-version-upgraded workspaces.
    const fieldIdsToSetEditable = fieldsToUpdate
      .filter((field) => field.isUIEditable)
      .map((field) => field.id);
    const fieldIdsToSetNonEditable = fieldsToUpdate
      .filter((field) => !field.isUIEditable)
      .map((field) => field.id);

    // All writes for a workspace run in one transaction so a mid-run failure
    // can't leave the flags partially applied.
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

      for (const objectToUpdate of objectsToUpdate) {
        await queryRunner.query(
          `UPDATE "core"."objectMetadata" SET "isUICreatable" = $1, "isUIEditable" = $2, "updatedAt" = now() WHERE "id" = $3`,
          [
            objectToUpdate.isUICreatable,
            objectToUpdate.isUIEditable,
            objectToUpdate.id,
          ],
        );
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner.release();
    }

    // The raw writes bypass the metadata cache, so invalidate the flat maps the
    // app reads these flags from (after the transaction has committed). The
    // flags are already persisted, so a cache hiccup must not fail the upgrade —
    // a stale cache self-heals on the next flush / version bump.
    try {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);
    } catch (cacheError) {
      this.logger.warn(
        `Synced UI capability flags for workspace ${workspaceId} but failed to invalidate the metadata cache: ${
          cacheError instanceof Error ? cacheError.message : String(cacheError)
        }`,
      );
    }

    this.logger.log(
      `Successfully synced UI capability flags on ${objectsToUpdate.length} standard object(s) and ${fieldsToUpdate.length} standard field(s) for workspace ${workspaceId}`,
    );
  }
}
