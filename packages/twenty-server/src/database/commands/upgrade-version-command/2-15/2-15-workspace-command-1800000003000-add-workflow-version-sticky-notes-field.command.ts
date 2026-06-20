import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
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

const WORKFLOW_VERSION_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.workflowVersion.universalIdentifier;

const NOTES_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.workflowVersion.fields.notes.universalIdentifier;

@RegisteredWorkspaceCommand('2.15.0', 1800000003000)
@Command({
  name: 'upgrade:2-15:add-workflow-version-sticky-notes-field',
  description:
    'Add notes JSONB field to the workflowVersion standard object for existing workspaces. Holds the array of visual sticky notes displayed in the workflow builder.',
})
export class AddWorkflowVersionStickyNotesFieldCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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

    const workflowVersionObject =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: WORKFLOW_VERSION_UNIVERSAL_IDENTIFIER,
      });

    if (!isDefined(workflowVersionObject)) {
      this.logger.log(
        `workflowVersion object not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const existingNotesField =
      findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier: NOTES_FIELD_UNIVERSAL_IDENTIFIER,
      });

    if (isDefined(existingNotesField)) {
      this.logger.log(
        `notes field already present on workflowVersion for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const createFieldInput: Omit<CreateFieldInput, 'workspaceId'> = {
      objectMetadataId: workflowVersionObject.id,
      name: 'notes',
      type: FieldMetadataType.RAW_JSON,
      label: 'Version notes',
      description: 'Json array of sticky notes',
      icon: 'IconSettingsAutomation',
      isNullable: true,
      isUIEditable: false,
      isSystem: false,
      isActive: true,
      universalIdentifier: NOTES_FIELD_UNIVERSAL_IDENTIFIER,
    };

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would create notes field on workflowVersion for workspace ${workspaceId}`,
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
        `Failed to add notes field on workflowVersion for workspace ${workspaceId}:\n${
          error instanceof Error ? error.stack : JSON.stringify(error, null, 2)
        }`,
      );
      throw error;
    }

    this.logger.log(
      `Added notes field on workflowVersion for workspace ${workspaceId}`,
    );
  }
}
