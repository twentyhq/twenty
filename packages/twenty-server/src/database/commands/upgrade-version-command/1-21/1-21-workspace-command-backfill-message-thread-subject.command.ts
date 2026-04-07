import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const MESSAGE_THREAD_OBJECT_NAME_SINGULAR = 'messageThread';
const SUBJECT_FIELD_NAME = 'subject';

@Command({
  name: 'upgrade:1-21:backfill-message-thread-subject',
  description:
    'Create the messageThread.subject field metadata and column if missing, then backfill subject from the most recently received message in each thread',
})
export class BackfillMessageThreadSubjectCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!dataSource) {
      this.logger.log(`No data source for workspace ${workspaceId}, skipping`);

      return;
    }

    const isDryRun = options.dryRun ?? false;

    await this.ensureSubjectFieldExists({ workspaceId, isDryRun });

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would backfill messageThread.subject for workspace ${workspaceId}`,
      );

      return;
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);

    const result = await dataSource.query(
      `UPDATE "${schemaName}"."messageThread" mt
       SET "subject" = sub.subject
       FROM (
         SELECT DISTINCT ON ("messageThreadId") "messageThreadId", "subject"
         FROM "${schemaName}"."message"
         ORDER BY "messageThreadId", "receivedAt" DESC NULLS LAST
       ) sub
       WHERE mt.id = sub."messageThreadId"
         AND mt."subject" IS NULL`,
      undefined,
      undefined,
      { shouldBypassPermissionChecks: true },
    );

    this.logger.log(
      `Backfilled subject for ${result?.[1] ?? 0} message threads in workspace ${workspaceId}`,
    );
  }

  private async ensureSubjectFieldExists({
    workspaceId,
    isDryRun,
  }: {
    workspaceId: string;
    isDryRun: boolean;
  }): Promise<void> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    const messageThreadObject = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .find(
        (object) =>
          object.nameSingular === MESSAGE_THREAD_OBJECT_NAME_SINGULAR,
      );

    if (!isDefined(messageThreadObject)) {
      this.logger.warn(
        `messageThread object metadata not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const existingSubjectField = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .find(
        (field) =>
          field.objectMetadataId === messageThreadObject.id &&
          field.name === SUBJECT_FIELD_NAME,
      );

    if (isDefined(existingSubjectField)) {
      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        shouldIncludeRecordPageLayouts: false,
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const standardSubjectField = Object.values(
      standardAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .find(
        (field) =>
          field.objectMetadataUniversalIdentifier ===
            messageThreadObject.universalIdentifier &&
          field.name === SUBJECT_FIELD_NAME,
      );

    if (!isDefined(standardSubjectField)) {
      this.logger.warn(
        `Standard messageThread.subject field not found in twenty-standard application, skipping workspace ${workspaceId}`,
      );

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would create messageThread.subject field metadata and column for workspace ${workspaceId}`,
      );

      return;
    }

    const fieldToCreate: FlatFieldMetadata = {
      ...standardSubjectField,
      id: v4(),
      objectMetadataId: messageThreadObject.id,
    };

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: [fieldToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to create messageThread.subject field for workspace ${workspaceId}:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to create messageThread.subject field for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Created messageThread.subject field metadata and column for workspace ${workspaceId}`,
    );
  }
}
