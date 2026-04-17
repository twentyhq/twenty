import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getDefaultFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-default-flat-field-metadata-from-create-field-input.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

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

  private findFieldByNameOnObject({
    flatFieldMetadataMaps,
    objectUniversalIdentifier,
    fieldName,
  }: {
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    objectUniversalIdentifier: string;
    fieldName: string;
  }): FlatFieldMetadata | undefined {
    return Object.values(flatFieldMetadataMaps.byUniversalIdentifier)
      .filter(isDefined)
      .find(
        (field) =>
          field.name === fieldName &&
          field.objectMetadataUniversalIdentifier === objectUniversalIdentifier,
      );
  }

  private async renameConflictingField({
    conflictingField,
    workspaceId,
  }: {
    conflictingField: FlatFieldMetadata;
    workspaceId: string;
  }): Promise<void> {
    const fieldToUpdate: UniversalFlatFieldMetadata = {
      ...conflictingField,
      name: 'subjectOld',
      label: 'Subject (old)',
    };

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [fieldToUpdate],
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            conflictingField.applicationUniversalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new Error(
        `Failed to rename conflicting subject field to subjectOld for workspace ${workspaceId}: ${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );
    }

    this.logger.log(
      `Renamed conflicting subject field to subjectOld for workspace ${workspaceId}`,
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

    const conflictingField = this.findFieldByNameOnObject({
      flatFieldMetadataMaps,
      objectUniversalIdentifier:
        messageThreadObjectMetadata.universalIdentifier,
      fieldName: 'subject',
    });

    if (isDefined(conflictingField)) {
      this.logger.log(
        `Found conflicting field named "subject" (universalIdentifier: ${conflictingField.universalIdentifier}) on messageThread for workspace ${workspaceId}, renaming to subjectOld`,
      );

      if (!isDryRun) {
        await this.renameConflictingField({
          conflictingField,
          workspaceId,
        });
      }
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
      throw new Error(
        `Failed to create messageThread.subject field for workspace ${workspaceId}: ${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );
    }

    this.logger.log(
      `Created messageThread.subject field for workspace ${workspaceId}`,
    );
  }
}
