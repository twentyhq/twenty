import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { getDefaultFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-default-flat-field-metadata-from-create-field-input.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('1.21.0', 1775500004000)
@Command({
  name: 'upgrade:1-21:backfill-message-thread-subject',
  description:
    'Create the messageThread.subject standard field if missing and backfill it from the most recently received message in each thread',
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

    await this.ensureSubjectFieldExists({
      workspaceId,
      isDryRun: !!options.dryRun,
    });

    if (options.dryRun) {
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

    const messageThreadObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: STANDARD_OBJECTS.messageThread.universalIdentifier,
      });

    if (!messageThreadObjectMetadata) {
      this.logger.log(
        `messageThread object metadata not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const existingField = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: flatFieldMetadataMaps,
      universalIdentifier:
        STANDARD_OBJECTS.messageThread.fields.subject.universalIdentifier,
    });

    if (existingField) {
      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would create messageThread.subject field for workspace ${workspaceId}`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const flatFieldMetadataToCreate = {
      ...getDefaultFlatFieldMetadata({
        createFieldInput: {
          name: 'subject',
          type: FieldMetadataType.TEXT,
          label: 'Subject',
          description: 'Subject',
          icon: 'IconMessage',
          isNullable: true,
          isUIReadOnly: true,
          universalIdentifier:
            STANDARD_OBJECTS.messageThread.fields.subject.universalIdentifier,
        },
        flatApplication: twentyStandardFlatApplication,
        objectMetadataUniversalIdentifier:
          messageThreadObjectMetadata.universalIdentifier,
      }),
      isCustom: false,
    };

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: [flatFieldMetadataToCreate],
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
      `Created messageThread.subject field for workspace ${workspaceId}`,
    );
  }
}
