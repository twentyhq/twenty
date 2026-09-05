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

// messageListMember is the junction between messageList and person. Each side
// of the many-to-many points at the junction column leading to the other side.
const MESSAGE_LIST_JUNCTIONS = [
  {
    label: 'messageList.members',
    junctionRelationFieldUniversalIdentifier:
      STANDARD_OBJECTS.messageList.fields.members.universalIdentifier,
    junctionTargetFieldUniversalIdentifier:
      STANDARD_OBJECTS.messageListMember.fields.person.universalIdentifier,
  },
  {
    label: 'person.listMemberships',
    junctionRelationFieldUniversalIdentifier:
      STANDARD_OBJECTS.person.fields.listMemberships.universalIdentifier,
    junctionTargetFieldUniversalIdentifier:
      STANDARD_OBJECTS.messageListMember.fields.list.universalIdentifier,
  },
] as const;

type MessageListJunction = (typeof MESSAGE_LIST_JUNCTIONS)[number];

type ResolvedBackfill = {
  label: string;
  junctionRelationFieldMetadataId: string;
  junctionTargetFieldMetadataId: string;
};

@RegisteredWorkspaceCommand('2.39.0', 1788616074386)
@Command({
  name: 'upgrade:2-39:backfill-message-list-junction-targets',
  description:
    'Backfill the junction target field id on both sides of the messageList/person many-to-many (messageList.members and person.listMemberships) for workspaces provisioned before it was declared. The 2-25 backfill only covered messageList.members, so person.listMemberships still renders as a plain one-to-many on the person record page instead of a list picker.',
})
export class BackfillMessageListJunctionTargetsCommand extends ProvisionedWorkspaceCommandRunner {
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

    const backfills = MESSAGE_LIST_JUNCTIONS.map((messageListJunction) =>
      this.resolveBackfill({
        messageListJunction,
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
        `No message list junction field was updated for workspace ${workspaceId}, its metadata changed since the cache was computed`,
      );

      return;
    }

    await invalidateFieldMetadataCache({
      workspaceId,
      workspaceMigrationRunnerService: this.workspaceMigrationRunnerService,
    });
  }

  // Both sides are written together so an interrupted upgrade never leaves the
  // list side migrated and the person side not, which would be invisible until a rerun.
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
    messageListJunction,
    flatFieldMetadataMaps,
    workspaceId,
  }: {
    messageListJunction: MessageListJunction;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    workspaceId: string;
  }): ResolvedBackfill | undefined {
    const {
      label,
      junctionRelationFieldUniversalIdentifier,
      junctionTargetFieldUniversalIdentifier,
    } = messageListJunction;

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
      flatFieldMetadataMaps.byUniversalIdentifier[
        junctionTargetFieldUniversalIdentifier
      ];

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

    if (
      !isFieldMetadataSettingsOfType(
        junctionTargetSettings,
        FieldMetadataType.RELATION,
      ) ||
      junctionTargetSettings.relationType !== RelationType.MANY_TO_ONE
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
