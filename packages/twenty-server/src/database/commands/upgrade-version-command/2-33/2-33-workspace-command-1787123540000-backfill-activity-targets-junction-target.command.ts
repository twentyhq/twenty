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
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

// These identifiers predate deterministic system relation identifiers and
// remain in standard workspaces provisioned before that migration.
const LEGACY_NOTE_TARGET_PERSON_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-38ca-4aab-92f5-8a605ca2e4c5';
const LEGACY_TASK_TARGET_PERSON_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-c8a0-4e85-a016-87e2349cfbec';

// The junction target points at one member of the target morph. Consumers expand
// the whole morph group from it, so any member identifies the polymorphic edge.
const ACTIVITY_JUNCTIONS = [
  {
    label: 'note.noteTargets',
    junctionRelationFieldUniversalIdentifier:
      STANDARD_OBJECTS.note.fields.noteTargets.universalIdentifier,
    junctionTargetFieldUniversalIdentifiers: [
      STANDARD_OBJECTS.noteTarget.fields.targetPerson.universalIdentifier,
      LEGACY_NOTE_TARGET_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
    ],
  },
  {
    label: 'task.taskTargets',
    junctionRelationFieldUniversalIdentifier:
      STANDARD_OBJECTS.task.fields.taskTargets.universalIdentifier,
    junctionTargetFieldUniversalIdentifiers: [
      STANDARD_OBJECTS.taskTarget.fields.targetPerson.universalIdentifier,
      LEGACY_TASK_TARGET_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
    ],
  },
] as const;

type ActivityJunction = (typeof ACTIVITY_JUNCTIONS)[number];

type ResolvedBackfill = {
  label: string;
  junctionRelationFieldMetadataId: string;
  junctionTargetFieldMetadataId: string;
};

@RegisteredWorkspaceCommand('2.33.0', 1787123540000)
@Command({
  name: 'upgrade:2-33:backfill-activity-targets-junction-target',
  description:
    'Backfill the junction target field id on note.noteTargets and task.taskTargets for workspaces provisioned before it was declared, so activity targets are recognised as junction relations.',
})
export class BackfillActivityTargetsJunctionTargetCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
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

    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const backfills = ACTIVITY_JUNCTIONS.map((activityJunction) =>
      this.resolveBackfill({
        activityJunction,
        flatFieldMetadataMaps,
        workspaceId,
      }),
    ).filter(isDefined);

    if (backfills.length === 0) {
      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Backfilling ${backfills
        .map(({ label }) => label)
        .join(', ')} junction target for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const updatedFieldMetadataIds = await this.applyBackfills({
      backfills,
      workspaceId,
    });

    if (updatedFieldMetadataIds.length === 0) {
      this.logger.warn(
        `No activity junction field was updated for workspace ${workspaceId}, its metadata changed since the cache was computed`,
      );

      return;
    }

    await invalidateFieldMetadataCache({
      workspaceId,
      workspaceMigrationRunnerService: this.workspaceMigrationRunnerService,
    });
  }

  // Both activity junctions are written together so an interrupted upgrade never
  // leaves notes migrated and tasks not, which would be invisible until a rerun.
  private async applyBackfills({
    backfills,
    workspaceId,
  }: {
    backfills: ResolvedBackfill[];
    workspaceId: string;
  }): Promise<string[]> {
    return this.fieldMetadataRepository.manager.transaction(
      async (entityManager) => {
        const fieldMetadataRepository =
          entityManager.getRepository(FieldMetadataEntity);
        const updatedFieldMetadataIds: string[] = [];

        for (const {
          label,
          junctionRelationFieldMetadataId,
          junctionTargetFieldMetadataId,
        } of backfills) {
          // Re-read under the transaction: the cache the resolution ran against
          // can lag the row, and settings is overwritten as a whole document.
          const fieldMetadata = await fieldMetadataRepository.findOne({
            where: { id: junctionRelationFieldMetadataId, workspaceId },
            lock: { mode: 'pessimistic_write' },
          });

          if (
            !isDefined(fieldMetadata) ||
            !isFieldMetadataSettingsOfType(
              fieldMetadata.settings,
              FieldMetadataType.RELATION,
            ) ||
            fieldMetadata.settings.relationType !== RelationType.ONE_TO_MANY
          ) {
            this.logger.warn(
              `${label} is no longer a one to many relation for workspace ${workspaceId}, skipping`,
            );

            continue;
          }

          await fieldMetadataRepository.update(
            { id: junctionRelationFieldMetadataId, workspaceId },
            {
              settings: {
                ...fieldMetadata.settings,
                junctionTargetFieldId: junctionTargetFieldMetadataId,
              },
            },
          );

          updatedFieldMetadataIds.push(junctionRelationFieldMetadataId);
        }

        return updatedFieldMetadataIds;
      },
    );
  }

  // Mirrors validateJunctionTargetSettings so the backfill can never write a
  // setting the metadata layer would have rejected on a normal field update.
  private resolveBackfill({
    activityJunction,
    flatFieldMetadataMaps,
    workspaceId,
  }: {
    activityJunction: ActivityJunction;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    workspaceId: string;
  }): ResolvedBackfill | undefined {
    const {
      label,
      junctionRelationFieldUniversalIdentifier,
      junctionTargetFieldUniversalIdentifiers,
    } = activityJunction;

    const junctionRelationFlatFieldMetadata =
      flatFieldMetadataMaps.byUniversalIdentifier[
        junctionRelationFieldUniversalIdentifier
      ];

    if (!isDefined(junctionRelationFlatFieldMetadata)) {
      this.logger.log(
        `No ${label} field for workspace ${workspaceId}, skipping`,
      );

      return undefined;
    }

    const junctionRelationSettings = junctionRelationFlatFieldMetadata.settings;

    if (
      !isFieldMetadataSettingsOfType(
        junctionRelationSettings,
        FieldMetadataType.RELATION,
      ) ||
      junctionRelationSettings.relationType !== RelationType.ONE_TO_MANY
    ) {
      this.logger.warn(
        `${label} is not a one to many relation for workspace ${workspaceId}, skipping`,
      );

      return undefined;
    }

    const junctionTargetFlatFieldMetadata =
      junctionTargetFieldUniversalIdentifiers
        .map(
          (universalIdentifier) =>
            flatFieldMetadataMaps.byUniversalIdentifier[universalIdentifier],
        )
        .find(isDefined);

    if (!isDefined(junctionTargetFlatFieldMetadata)) {
      this.logger.warn(
        `No junction target field for ${label} in workspace ${workspaceId}, skipping`,
      );

      return undefined;
    }

    if (
      junctionTargetFlatFieldMetadata.objectMetadataId !==
      junctionRelationFlatFieldMetadata.relationTargetObjectMetadataId
    ) {
      this.logger.warn(
        `Junction target field for ${label} is not on the junction object in workspace ${workspaceId}, skipping`,
      );

      return undefined;
    }

    const junctionTargetSettings = junctionTargetFlatFieldMetadata.settings;
    const isMorphTarget =
      junctionTargetFlatFieldMetadata.type === FieldMetadataType.MORPH_RELATION;

    if (
      !isMorphTarget &&
      (!isFieldMetadataSettingsOfType(
        junctionTargetSettings,
        FieldMetadataType.RELATION,
      ) ||
        junctionTargetSettings.relationType !== RelationType.MANY_TO_ONE)
    ) {
      this.logger.warn(
        `Junction target field for ${label} is not a many to one relation in workspace ${workspaceId}, skipping`,
      );

      return undefined;
    }

    const currentJunctionTargetFieldId =
      junctionRelationSettings.junctionTargetFieldId;

    // A dangling id is repaired: it resolves to nothing, so leaving it in place
    // keeps the junction unusable while looking configured.
    if (
      isDefined(currentJunctionTargetFieldId) &&
      isDefined(
        flatFieldMetadataMaps.universalIdentifierById[
          currentJunctionTargetFieldId
        ],
      )
    ) {
      this.logger.log(
        `${label} junction target already set for workspace ${workspaceId}, skipping`,
      );

      return undefined;
    }

    return {
      label,
      junctionRelationFieldMetadataId: junctionRelationFlatFieldMetadata.id,
      junctionTargetFieldMetadataId: junctionTargetFlatFieldMetadata.id,
    };
  }
}
