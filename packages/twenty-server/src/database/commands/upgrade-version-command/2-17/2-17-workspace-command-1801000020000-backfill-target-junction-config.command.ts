import { Command } from 'nest-commander';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, type SerializedRelation } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const JUNCTION_FIELD_CONFIGS: {
  sourceFieldUniversalIdentifier: string;
  targetFieldUniversalIdentifier: string;
}[] = [
  {
    sourceFieldUniversalIdentifier:
      STANDARD_OBJECTS.person.fields.noteTargets.universalIdentifier,
    targetFieldUniversalIdentifier:
      STANDARD_OBJECTS.noteTarget.fields.note.universalIdentifier,
  },
  {
    sourceFieldUniversalIdentifier:
      STANDARD_OBJECTS.person.fields.taskTargets.universalIdentifier,
    targetFieldUniversalIdentifier:
      STANDARD_OBJECTS.taskTarget.fields.task.universalIdentifier,
  },
  {
    sourceFieldUniversalIdentifier:
      STANDARD_OBJECTS.company.fields.noteTargets.universalIdentifier,
    targetFieldUniversalIdentifier:
      STANDARD_OBJECTS.noteTarget.fields.note.universalIdentifier,
  },
  {
    sourceFieldUniversalIdentifier:
      STANDARD_OBJECTS.company.fields.taskTargets.universalIdentifier,
    targetFieldUniversalIdentifier:
      STANDARD_OBJECTS.taskTarget.fields.task.universalIdentifier,
  },
  {
    sourceFieldUniversalIdentifier:
      STANDARD_OBJECTS.opportunity.fields.noteTargets.universalIdentifier,
    targetFieldUniversalIdentifier:
      STANDARD_OBJECTS.noteTarget.fields.note.universalIdentifier,
  },
  {
    sourceFieldUniversalIdentifier:
      STANDARD_OBJECTS.opportunity.fields.taskTargets.universalIdentifier,
    targetFieldUniversalIdentifier:
      STANDARD_OBJECTS.taskTarget.fields.task.universalIdentifier,
  },
  {
    sourceFieldUniversalIdentifier:
      STANDARD_OBJECTS.note.fields.noteTargets.universalIdentifier,
    targetFieldUniversalIdentifier:
      STANDARD_OBJECTS.noteTarget.fields.targetPerson.universalIdentifier,
  },
  {
    sourceFieldUniversalIdentifier:
      STANDARD_OBJECTS.task.fields.taskTargets.universalIdentifier,
    targetFieldUniversalIdentifier:
      STANDARD_OBJECTS.taskTarget.fields.targetCompany.universalIdentifier,
  },
];

@RegisteredWorkspaceCommand('2.17.0', 1801000020000)
@Command({
  name: 'upgrade:2-17:backfill-target-junction-config',
  description:
    'Arm junction config on person/company/opportunity noteTargets & taskTargets relation fields so existing workspaces expose note/task as M2M junctions. Idempotent: fields already armed are skipped.',
})
export class BackfillTargetJunctionConfigCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const now = new Date().toISOString();
    const fieldsToUpdate: FlatFieldMetadata[] = [];

    for (const {
      sourceFieldUniversalIdentifier,
      targetFieldUniversalIdentifier,
    } of JUNCTION_FIELD_CONFIGS) {
      const sourceField =
        flatFieldMetadataMaps.byUniversalIdentifier[
          sourceFieldUniversalIdentifier
        ];
      const targetField =
        flatFieldMetadataMaps.byUniversalIdentifier[
          targetFieldUniversalIdentifier
        ];

      if (!isDefined(sourceField) || !isDefined(targetField)) {
        continue;
      }

      if (sourceField.type !== FieldMetadataType.RELATION) {
        continue;
      }

      const relationField =
        sourceField as FlatFieldMetadata<FieldMetadataType.RELATION>;

      if (isDefined(relationField.settings?.junctionTargetFieldId)) {
        continue;
      }

      fieldsToUpdate.push({
        ...relationField,
        settings: {
          ...relationField.settings,
          junctionTargetFieldId: targetField.id as SerializedRelation,
        },
        universalSettings: {
          ...relationField.universalSettings,
          junctionTargetFieldUniversalIdentifier:
            targetFieldUniversalIdentifier,
        },
        updatedAt: now,
      } as FlatFieldMetadata);
    }

    if (fieldsToUpdate.length === 0) {
      this.logger.log(
        `Junction config already armed for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Arming junction config on ${fieldsToUpdate.length} relation field(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          workspaceId,
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: fieldsToUpdate,
            },
          },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new Error(
        `Failed to arm junction config for workspace ${workspaceId}: ${JSON.stringify(
          validateAndBuildResult,
          null,
          2,
        )}`,
      );
    }

    this.logger.log(
      `Armed junction config on ${fieldsToUpdate.length} relation field(s) for workspace ${workspaceId}`,
    );
  }
}
