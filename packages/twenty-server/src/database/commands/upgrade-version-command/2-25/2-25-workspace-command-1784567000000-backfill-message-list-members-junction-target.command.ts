import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isFieldMetadataSettingsOfType } from 'src/engine/metadata-modules/field-metadata/utils/is-field-metadata-settings-of-type.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { getMetadataSerializedRelationNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-serialized-relation-names.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

const MEMBERS_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.messageList.fields.members.universalIdentifier;

const PERSON_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.messageListMember.fields.person.universalIdentifier;

@RegisteredWorkspaceCommand('2.25.0', 1784567000000)
@Command({
  name: 'upgrade:2-25:backfill-message-list-members-junction-target',
  description:
    'Backfill the junction target field id on messageList.members for workspaces provisioned before it was declared, so the record page renders the members junction picker.',
})
export class BackfillMessageListMembersJunctionTargetCommand extends ProvisionedWorkspaceCommandRunner {
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

    const membersFlatFieldMetadata =
      flatFieldMetadataMaps.byUniversalIdentifier[
        MEMBERS_FIELD_UNIVERSAL_IDENTIFIER
      ];

    if (!isDefined(membersFlatFieldMetadata)) {
      this.logger.log(
        `No messageList.members field for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const currentSettings = membersFlatFieldMetadata.settings;

    if (
      !isFieldMetadataSettingsOfType(currentSettings, FieldMetadataType.RELATION)
    ) {
      this.logger.warn(
        `messageList.members has no relation settings for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (isDefined(currentSettings.junctionTargetFieldId)) {
      this.logger.log(
        `messageList.members junction target already set for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const personFlatFieldMetadata =
      flatFieldMetadataMaps.byUniversalIdentifier[
        PERSON_FIELD_UNIVERSAL_IDENTIFIER
      ];

    if (!isDefined(personFlatFieldMetadata)) {
      this.logger.warn(
        `No messageListMember.person field for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const updatedSettings = {
      ...currentSettings,
      junctionTargetFieldId: personFlatFieldMetadata.id,
    };

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Backfilling messageList.members junction target for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    await this.fieldMetadataRepository.update(
      { id: membersFlatFieldMetadata.id, workspaceId },
      { settings: updatedSettings },
    );

    const fieldMetadataRelatedNames = [
      'fieldMetadata',
      ...getMetadataRelatedMetadataNames('fieldMetadata'),
      ...getMetadataSerializedRelationNames('fieldMetadata'),
      'index',
    ] as const;
    const allFlatEntityMapsKeys = [
      ...new Set(fieldMetadataRelatedNames.map(getMetadataFlatEntityMapsKey)),
    ];

    await this.workspaceMigrationRunnerService.invalidateCache({
      allFlatEntityMapsKeys,
      workspaceId,
    });

    this.logger.log(
      `Backfilled messageList.members junction target for workspace ${workspaceId}`,
    );
  }
}
