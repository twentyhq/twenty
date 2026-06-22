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

const TIMELINE_ACTIVITY_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.timelineActivity.universalIdentifier;

const KIND_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.timelineActivity.fields.kind.universalIdentifier;

@RegisteredWorkspaceCommand('2.15.0', 1800000003000)
@Command({
  name: 'upgrade:2-15:add-timeline-activity-kind-field',
  description:
    'Add the kind field to the timelineActivity standard object for existing workspaces. The column must exist before the new code path writes kind on every timeline activity.',
})
export class AddTimelineActivityKindFieldCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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

    const timelineActivityObject =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: TIMELINE_ACTIVITY_UNIVERSAL_IDENTIFIER,
      });

    if (!isDefined(timelineActivityObject)) {
      this.logger.log(
        `timelineActivity object not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const existingKindField =
      findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier: KIND_FIELD_UNIVERSAL_IDENTIFIER,
      });

    if (isDefined(existingKindField)) {
      this.logger.log(
        `kind field already present on timelineActivity for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const createFieldInput: Omit<CreateFieldInput, 'workspaceId'> = {
      objectMetadataId: timelineActivityObject.id,
      name: 'kind',
      type: FieldMetadataType.TEXT,
      label: 'Kind',
      description: 'Activity kind',
      icon: 'IconCategory',
      isNullable: true,
      isUIReadOnly: true,
      isSystem: true,
      isActive: true,
      universalIdentifier: KIND_FIELD_UNIVERSAL_IDENTIFIER,
    };

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would create kind field on timelineActivity for workspace ${workspaceId}`,
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
        `Failed to add kind field on timelineActivity for workspace ${workspaceId}:\n${
          error instanceof Error ? error.stack : JSON.stringify(error, null, 2)
        }`,
      );
      throw error;
    }

    this.logger.log(
      `Added kind field on timelineActivity for workspace ${workspaceId}`,
    );
  }
}
