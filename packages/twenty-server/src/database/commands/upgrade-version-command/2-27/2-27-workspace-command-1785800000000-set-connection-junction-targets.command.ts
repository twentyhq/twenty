import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { findFlatFieldMetadataByName } from 'src/database/commands/upgrade-version-command/2-27/utils/find-flat-field-metadata-by-name.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isFieldMetadataSettingsOfType } from 'src/engine/metadata-modules/field-metadata/utils/is-field-metadata-settings-of-type.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { getMetadataSerializedRelationNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-serialized-relation-names.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

const CONNECTION_OBJECT_NAME_SINGULAR = 'connection';
const PERSON_OBJECT_NAME_SINGULAR = 'person';

// person.connections lists the connection rows this person owns, so its
// junction target is the other side of the row, and vice versa
const JUNCTION_TARGETS_BY_PERSON_FIELD_NAME = {
  connections: 'connectedTo',
  connectedFrom: 'person',
} as const;

@RegisteredWorkspaceCommand('2.27.0', 1785800000000)
@Command({
  name: 'upgrade:2-27:set-connection-junction-targets',
  description:
    'Configure person.connections and person.connectedFrom as junction relations through the connection object, so a person record page picks people directly instead of connection rows.',
})
export class SetConnectionJunctionTargetsCommand extends ProvisionedWorkspaceCommandRunner {
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

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    const hasConnectionObject = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    ).some(
      (candidate) =>
        candidate?.nameSingular === CONNECTION_OBJECT_NAME_SINGULAR,
    );

    if (!hasConnectionObject) {
      this.logger.log(
        `No connection object for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    let updatedFieldCount = 0;

    for (const [personFieldName, connectionFieldName] of Object.entries(
      JUNCTION_TARGETS_BY_PERSON_FIELD_NAME,
    )) {
      const personFlatFieldMetadata = findFlatFieldMetadataByName({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        objectNameSingular: PERSON_OBJECT_NAME_SINGULAR,
        fieldName: personFieldName,
      });

      if (!isDefined(personFlatFieldMetadata)) {
        this.logger.warn(
          `No person.${personFieldName} field for workspace ${workspaceId}, skipping`,
        );

        continue;
      }

      const currentSettings = personFlatFieldMetadata.settings;

      if (
        !isFieldMetadataSettingsOfType(
          currentSettings,
          FieldMetadataType.RELATION,
        )
      ) {
        this.logger.warn(
          `person.${personFieldName} has no relation settings for workspace ${workspaceId}, skipping`,
        );

        continue;
      }

      if (isDefined(currentSettings.junctionTargetFieldId)) {
        this.logger.log(
          `person.${personFieldName} junction target already set for workspace ${workspaceId}, skipping`,
        );

        continue;
      }

      const connectionFlatFieldMetadata = findFlatFieldMetadataByName({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        objectNameSingular: CONNECTION_OBJECT_NAME_SINGULAR,
        fieldName: connectionFieldName,
      });

      if (!isDefined(connectionFlatFieldMetadata)) {
        this.logger.warn(
          `No connection.${connectionFieldName} field for workspace ${workspaceId}, skipping`,
        );

        continue;
      }

      this.logger.log(
        `${isDryRun ? '[DRY RUN] ' : ''}Setting person.${personFieldName} junction target to connection.${connectionFieldName} for workspace ${workspaceId}`,
      );

      if (isDryRun) {
        continue;
      }

      await this.fieldMetadataRepository.update(
        { id: personFlatFieldMetadata.id, workspaceId },
        {
          settings: {
            ...currentSettings,
            junctionTargetFieldId: connectionFlatFieldMetadata.id,
          },
        },
      );

      updatedFieldCount += 1;
    }

    if (updatedFieldCount === 0) {
      return;
    }

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
      `Set ${updatedFieldCount} connection junction target(s) for workspace ${workspaceId}`,
    );
  }
}
