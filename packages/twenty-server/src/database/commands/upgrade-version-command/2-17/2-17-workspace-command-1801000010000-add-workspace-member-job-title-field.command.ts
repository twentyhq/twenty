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

const WORKSPACE_MEMBER_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.workspaceMember.universalIdentifier;

const JOB_TITLE_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.workspaceMember.fields.jobTitle.universalIdentifier;

@RegisteredWorkspaceCommand('2.17.0', 1801000010000)
@Command({
  name: 'upgrade:2-17:add-workspace-member-job-title-field',
  description:
    'Add jobTitle text field to the workspaceMember standard object for existing workspaces. Captured during onboarding to describe how a member appears to teammates and agents.',
})
export class AddWorkspaceMemberJobTitleFieldCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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

    const workspaceMemberObject =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: WORKSPACE_MEMBER_UNIVERSAL_IDENTIFIER,
      });

    if (!isDefined(workspaceMemberObject)) {
      this.logger.log(
        `workspaceMember object not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const existingJobTitleField =
      findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier: JOB_TITLE_FIELD_UNIVERSAL_IDENTIFIER,
      });

    if (isDefined(existingJobTitleField)) {
      this.logger.log(
        `jobTitle field already present on workspaceMember for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const createFieldInput: Omit<CreateFieldInput, 'workspaceId'> = {
      objectMetadataId: workspaceMemberObject.id,
      name: 'jobTitle',
      type: FieldMetadataType.TEXT,
      label: 'Job Title',
      description: 'Workspace member job title',
      icon: 'IconBriefcase',
      isNullable: true,
      isUIReadOnly: true,
      isSystem: true,
      isActive: true,
      universalIdentifier: JOB_TITLE_FIELD_UNIVERSAL_IDENTIFIER,
    };

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would create jobTitle field on workspaceMember for workspace ${workspaceId}`,
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
        `Failed to add jobTitle field on workspaceMember for workspace ${workspaceId}:\n${
          error instanceof Error ? error.stack : JSON.stringify(error, null, 2)
        }`,
      );
      throw error;
    }

    this.logger.log(
      `Added jobTitle field on workspaceMember for workspace ${workspaceId}`,
    );
  }
}
