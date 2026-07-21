import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKFLOW_RUN_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.workflowRun.universalIdentifier;

const STEP_LOGS_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.workflowRun.fields.stepLogs.universalIdentifier;

@RegisteredWorkspaceCommand('2.9.0', 1799000035000)
@Command({
  name: 'upgrade:2-9:add-workflow-run-step-logs-field',
  description:
    'Add stepLogs JSONB field to the workflowRun standard object for existing workspaces. Per-step observability payload (token usage, tool calls, log entries) is written here.',
})
export class AddWorkflowRunStepLogsFieldCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly fieldMetadataService: FieldMetadataService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    const workflowRunObject =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: WORKFLOW_RUN_UNIVERSAL_IDENTIFIER,
      });

    if (!isDefined(workflowRunObject)) {
      this.logger.log(
        `workflowRun object not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const existingStepLogsField =
      findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier: STEP_LOGS_FIELD_UNIVERSAL_IDENTIFIER,
      });

    if (isDefined(existingStepLogsField)) {
      this.logger.log(
        `stepLogs field already present on workflowRun for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const createFieldInput: Omit<CreateFieldInput, 'workspaceId'> = {
      objectMetadataId: workflowRunObject.id,
      name: 'stepLogs',
      type: FieldMetadataType.RAW_JSON,
      label: 'Step logs',
      description:
        'Per-step observability payload (token usage, tool calls, log entries)',
      icon: 'IconTerminal2',
      isNullable: true,
      isUIReadOnly: true,
      isSystem: true,
      isActive: true,
      universalIdentifier: STEP_LOGS_FIELD_UNIVERSAL_IDENTIFIER,
    };

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would create stepLogs field on workflowRun for workspace ${workspaceId}`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    try {
      await this.fieldMetadataService.createManyFields({
        createFieldInputs: [createFieldInput],
        workspaceId,
        ownerFlatApplication: twentyStandardFlatApplication,
        isSystemBuild: true,
      });
    } catch (error) {
      this.logger.error(
        `Failed to add stepLogs field on workflowRun for workspace ${workspaceId}:\n${
          error instanceof Error ? error.stack : JSON.stringify(error, null, 2)
        }`,
      );
      throw error;
    }

    this.logger.log(
      `Added stepLogs field on workflowRun for workspace ${workspaceId}`,
    );
  }
}
