import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { type Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';
import { AllStandardFieldByObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { FieldMetadataComplexOption } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const ENUM_FIELD_OPTIONS_TO_MUTATE = {
  messageChannelMessageAssociation: {
    field: 'direction',
    defaultValue: "'INCOMING'",
    options: [
      { value: 'INCOMING', label: 'Incoming', position: 0, color: 'green' },
      { value: 'OUTGOING', label: 'Outgoing', position: 1, color: 'blue' },
    ],
  },
  messageChannel: {
    field: 'type',
    defaultValue: "'EMAIL'",
    options: [
      { value: 'EMAIL', label: 'Email', position: 0, color: 'green' },
      { value: 'SMS', label: 'SMS', position: 1, color: 'blue' },
    ],
  },
  messageParticipant: {
    field: 'role',
    defaultValue: "'FROM'",
    options: [
      { value: 'FROM', label: 'From', position: 0, color: 'green' },
      { value: 'TO', label: 'To', position: 1, color: 'blue' },
      { value: 'CC', label: 'Cc', position: 2, color: 'orange' },
      { value: 'BCC', label: 'Bcc', position: 3, color: 'red' },
    ],
  },
  workspaceMember: {
    field: 'numberFormat',
    defaultValue: "'SYSTEM'",
    options: [
      { value: 'SYSTEM', label: 'System', position: 0, color: 'turquoise' },
      {
        value: 'COMMAS_AND_DOT',
        label: 'Commas and dot',
        position: 1,
        color: 'blue',
      },
      {
        value: 'SPACES_AND_COMMA',
        label: 'Spaces and comma',
        position: 2,
        color: 'green',
      },
      {
        value: 'DOTS_AND_COMMA',
        label: 'Dots and comma',
        position: 3,
        color: 'orange',
      },
      {
        value: 'APOSTROPHE_AND_DOT',
        label: 'Apostrophe and dot',
        position: 4,
        color: 'purple',
      },
    ],
  },
} as const satisfies {
  [P in AllStandardObjectName]?: {
    field: AllStandardFieldByObjectName<P>;
    options: FieldMetadataComplexOption[];
    defaultValue: string;
  };
};

@Command({
  name: 'upgrade:1-13:migrate-standard-invalid-entities',
  description: 'Migrate standard invalid entities',
})
export class MigrateStandardInvalidEntitiesCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly fieldMetadataService: FieldMetadataService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    options,
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun || false;

    this.logger.log(
      `MigrateStandardInvalidEntitiesCommand starting for workspace ${workspaceId}`,
    );
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const iCalUidFieldId =
      flatFieldMetadataMaps.idByUniversalIdentifier[
        STANDARD_OBJECTS.calendarEvent.fields.iCalUid.universalIdentifier
      ];

    if (!isDefined(iCalUidFieldId)) {
      throw new Error(
        `Could not find caldavuid id for workspace ${workspaceId}`,
      );
    }

    if (!isDefined(iCalUidFieldId)) {
      throw new Error(
        `Could not find caldavuid id for workspace ${workspaceId}`,
      );
    }

    const allAffectedObjectNames = Object.keys(
      ENUM_FIELD_OPTIONS_TO_MUTATE,
    ).filter(isDefined) as (keyof typeof ENUM_FIELD_OPTIONS_TO_MUTATE)[];

    const flatEnumFieldMetadatasToUpdate = allAffectedObjectNames.flatMap<
      Omit<UpdateFieldInput, 'workspaceId'>
    >((objectName) => {
      const { defaultValue, field, options } =
        ENUM_FIELD_OPTIONS_TO_MUTATE[objectName];

      const universalIdentifier =
        STANDARD_OBJECTS[objectName].fields[
          field as AllStandardFieldByObjectName<typeof objectName>
        ].universalIdentifier;

      const fieldMetadataId =
        flatFieldMetadataMaps.idByUniversalIdentifier[universalIdentifier];

      if (!isDefined(fieldMetadataId)) {
        throw new Error(
          `Could not find field ${field} of object ${objectName} in workspace ${workspaceId} universalIdentifier ${universalIdentifier}`,
        );
      }

      const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: fieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      if (!isDefined(flatFieldMetadata)) {
        throw new Error(
          `Could not find flat field ${field} of object ${objectName} in workspace ${workspaceId} universalIdentifier ${universalIdentifier} cache`,
        );
      }

      if (flatFieldMetadata.name !== field) {
        throw new Error(
          `Retrieved flat field is not the one expected expected ${field} got ${flatFieldMetadata.name} in workspace ${workspaceId}`,
        );
      }

      return {
        id: fieldMetadataId,
        options,
        defaultValue,
      };
    });

    if (!isDryRun) {
      for (const updateFieldInput of [
        {
          id: iCalUidFieldId,
          name: 'iCalUid',
        },
        ...flatEnumFieldMetadatasToUpdate,
      ])
        await this.fieldMetadataService.updateOneField({
          updateFieldInput,
          workspaceId,
          isSystemBuild: true,
        });
    }
    this.logger.log('Migrated standard invalid entities');
  }
}
