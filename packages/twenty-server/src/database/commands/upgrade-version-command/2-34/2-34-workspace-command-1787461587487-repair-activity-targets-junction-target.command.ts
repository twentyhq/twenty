import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { invalidateFieldMetadataCache } from 'src/database/commands/upgrade-version-command/utils/invalidate-field-metadata-cache.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isFieldMetadataSettingsOfType } from 'src/engine/metadata-modules/field-metadata/utils/is-field-metadata-settings-of-type.util';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

const LEGACY_NOTE_TARGET_PERSON_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-38ca-4aab-92f5-8a605ca2e4c5';
const LEGACY_TASK_TARGET_PERSON_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-c8a0-4e85-a016-87e2349cfbec';

const ACTIVITY_JUNCTIONS = [
  {
    label: 'note.noteTargets',
    junctionRelationFieldUniversalIdentifier:
      STANDARD_OBJECTS.note.fields.noteTargets.universalIdentifier,
    targetMorphId: STANDARD_OBJECTS.noteTarget.morphIds.targetMorphId.morphId,
    preferredTargetFieldUniversalIdentifiers: [
      STANDARD_OBJECTS.noteTarget.fields.targetPerson.universalIdentifier,
      LEGACY_NOTE_TARGET_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
    ],
  },
  {
    label: 'task.taskTargets',
    junctionRelationFieldUniversalIdentifier:
      STANDARD_OBJECTS.task.fields.taskTargets.universalIdentifier,
    targetMorphId: STANDARD_OBJECTS.taskTarget.morphIds.targetMorphId.morphId,
    preferredTargetFieldUniversalIdentifiers: [
      STANDARD_OBJECTS.taskTarget.fields.targetPerson.universalIdentifier,
      LEGACY_TASK_TARGET_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
    ],
  },
] as const;

type ActivityJunction = (typeof ACTIVITY_JUNCTIONS)[number];

@RegisteredWorkspaceCommand('2.34.0', 1787461587487)
@Command({
  name: 'upgrade:2-34:repair-activity-targets-junction-target',
  description:
    'Repair note and task activity junction target settings when the target morph only contains custom object fields.',
})
export class RepairActivityTargetsJunctionTargetCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;
    const repairedLabels =
      await this.fieldMetadataRepository.manager.transaction(
        async (entityManager) => {
          const fieldMetadataRepository =
            entityManager.getRepository(FieldMetadataEntity);
          const activeFieldMetadatas = await fieldMetadataRepository.find({
            where: { workspaceId, isActive: true },
            order: { universalIdentifier: 'ASC' },
          });
          const repairedLabels: string[] = [];

          for (const activityJunction of ACTIVITY_JUNCTIONS) {
            const repaired = await this.repairActivityJunction({
              activityJunction,
              activeFieldMetadatas,
              fieldMetadataRepository,
              isDryRun,
              workspaceId,
            });

            if (repaired) {
              repairedLabels.push(activityJunction.label);
            }
          }

          return repairedLabels;
        },
      );

    if (repairedLabels.length === 0) {
      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] Would repair' : 'Repaired'} ${repairedLabels.join(', ')} junction target for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    await invalidateFieldMetadataCache({
      workspaceId,
      workspaceMigrationRunnerService: this.workspaceMigrationRunnerService,
    });
  }

  private async repairActivityJunction({
    activityJunction,
    activeFieldMetadatas,
    fieldMetadataRepository,
    isDryRun,
    workspaceId,
  }: {
    activityJunction: ActivityJunction;
    activeFieldMetadatas: FieldMetadataEntity[];
    fieldMetadataRepository: Repository<FieldMetadataEntity>;
    isDryRun: boolean;
    workspaceId: string;
  }): Promise<boolean> {
    const junctionRelationFieldMetadata = activeFieldMetadatas.find(
      ({ universalIdentifier }) =>
        universalIdentifier ===
        activityJunction.junctionRelationFieldUniversalIdentifier,
    );

    if (!isDefined(junctionRelationFieldMetadata)) {
      return false;
    }

    const junctionTargetFieldMetadatas = activeFieldMetadatas
      .filter((fieldMetadata) =>
        this.isValidJunctionTargetFieldMetadata({
          activityJunction,
          fieldMetadata,
          junctionRelationFieldMetadata,
        }),
      )
      .sort(
        (firstFieldMetadata, secondFieldMetadata) =>
          this.getTargetFieldPriority({
            activityJunction,
            fieldMetadata: firstFieldMetadata,
          }) -
          this.getTargetFieldPriority({
            activityJunction,
            fieldMetadata: secondFieldMetadata,
          }),
      );
    const junctionTargetFieldMetadata = junctionTargetFieldMetadatas[0];

    if (!isDefined(junctionTargetFieldMetadata)) {
      this.logger.warn(
        `No valid junction target field for ${activityJunction.label} in workspace ${workspaceId}, skipping`,
      );

      return false;
    }

    const lockedJunctionRelationFieldMetadata =
      await fieldMetadataRepository.findOne({
        where: { id: junctionRelationFieldMetadata.id, workspaceId },
        lock: { mode: 'pessimistic_write' },
      });

    if (
      !isDefined(lockedJunctionRelationFieldMetadata) ||
      !isFieldMetadataSettingsOfType(
        lockedJunctionRelationFieldMetadata.settings,
        FieldMetadataType.RELATION,
      ) ||
      lockedJunctionRelationFieldMetadata.settings.relationType !==
        RelationType.ONE_TO_MANY
    ) {
      this.logger.warn(
        `${activityJunction.label} is no longer a one to many relation for workspace ${workspaceId}, skipping`,
      );

      return false;
    }

    const lockedJunctionRelationSettings =
      lockedJunctionRelationFieldMetadata.settings;

    if (
      junctionTargetFieldMetadatas.some(
        ({ id }) =>
          id === lockedJunctionRelationSettings.junctionTargetFieldId,
      )
    ) {
      return false;
    }

    if (isDryRun) {
      return true;
    }

    await fieldMetadataRepository.update(
      { id: lockedJunctionRelationFieldMetadata.id, workspaceId },
      {
        settings: {
          ...lockedJunctionRelationSettings,
          junctionTargetFieldId: junctionTargetFieldMetadata.id,
        },
      },
    );

    return true;
  }

  private isValidJunctionTargetFieldMetadata({
    activityJunction,
    fieldMetadata,
    junctionRelationFieldMetadata,
  }: {
    activityJunction: ActivityJunction;
    fieldMetadata: FieldMetadataEntity;
    junctionRelationFieldMetadata: FieldMetadataEntity;
  }): boolean {
    if (
      !isDefined(
        junctionRelationFieldMetadata.relationTargetObjectMetadataId,
      ) ||
      fieldMetadata.objectMetadataId !==
        junctionRelationFieldMetadata.relationTargetObjectMetadataId
    ) {
      return false;
    }

    if (fieldMetadata.type === FieldMetadataType.MORPH_RELATION) {
      return (
        fieldMetadata.morphId === activityJunction.targetMorphId &&
        isFieldMetadataSettingsOfType(
          fieldMetadata.settings,
          FieldMetadataType.MORPH_RELATION,
        ) &&
        fieldMetadata.settings.relationType === RelationType.MANY_TO_ONE
      );
    }

    return (
      fieldMetadata.type === FieldMetadataType.RELATION &&
      activityJunction.preferredTargetFieldUniversalIdentifiers.includes(
        fieldMetadata.universalIdentifier,
      ) &&
      isFieldMetadataSettingsOfType(
        fieldMetadata.settings,
        FieldMetadataType.RELATION,
      ) &&
      fieldMetadata.settings.relationType === RelationType.MANY_TO_ONE
    );
  }

  private getTargetFieldPriority({
    activityJunction,
    fieldMetadata,
  }: {
    activityJunction: ActivityJunction;
    fieldMetadata: FieldMetadataEntity;
  }): number {
    const preferredIndex =
      activityJunction.preferredTargetFieldUniversalIdentifiers.indexOf(
        fieldMetadata.universalIdentifier,
      );

    return preferredIndex === -1 ? Number.MAX_SAFE_INTEGER : preferredIndex;
  }
}
