import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import {
  type FieldMetadataComplexOption,
  type FieldMetadataDefaultValue,
  FieldMetadataType,
  type FromTo,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import {
  CALENDAR_EVENT_STANDARD_FIELD_IDS,
  MESSAGE_CHANNEL_STANDARD_FIELD_IDS,
  MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS,
  MESSAGE_STANDARD_FIELD_IDS,
  WORKSPACE_MEMBER_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

const findStandardFlatObjectMetadataOrThrow = ({
  flatObjectMetadataMaps,
  standardId,
}: {
  flatObjectMetadataMaps: MetadataFlatEntityMaps<'objectMetadata'>;
  standardId: string;
}): FlatObjectMetadata => {
  const flatObjectMetadata = Object.values(flatObjectMetadataMaps.byId).find(
    (flatObjectMetadata) => flatObjectMetadata?.standardId === standardId,
  );

  if (!isDefined(flatObjectMetadata)) {
    throw new Error(`Could not find standard object ${standardId}`);
  }

  return flatObjectMetadata;
};

const findStandardFlatFieldMetadatawOrThrow = ({
  flatFieldMetadataMaps,
  flatObjectMetadata,
  standardId,
}: {
  standardId: string;
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: MetadataFlatEntityMaps<'fieldMetadata'>;
}) => {
  const objectFlatFieldMetadata = findManyFlatEntityByIdInFlatEntityMapsOrThrow(
    {
      flatEntityIds: flatObjectMetadata.fieldMetadataIds,
      flatEntityMaps: flatFieldMetadataMaps,
    },
  );

  const flatFieldMetadata = objectFlatFieldMetadata.find(
    (flatFieldMetadata) => flatFieldMetadata.standardId === standardId,
  );

  if (!isDefined(flatFieldMetadata)) {
    throw new Error(`Could not find standard field ${standardId}`);
  }

  return flatFieldMetadata;
};

const ENUM_FIELD_OPTIONS_TO_MUTATE = {
  messageChannelMessageAssociation: {
    fieldStandardId: MESSAGE_STANDARD_FIELD_IDS.direction,
    field: 'direction',
    defaultValue: {
      fromDefaultValue: "'incoming'",
      toDefaultValue: "'INCOMING'",
    },
    options: [
      {
        fromOption: {
          value: 'incoming',
          label: 'Incoming',
          position: 0,
          color: 'green',
        },
        toOption: {
          value: 'INCOMING',
          label: 'Incoming',
          position: 0,
          color: 'green',
        },
      },
      {
        fromOption: {
          value: 'outgoing',
          label: 'Outgoing',
          position: 1,
          color: 'blue',
        },
        toOption: {
          value: 'OUTGOING',
          label: 'Outgoing',
          position: 1,
          color: 'blue',
        },
      },
    ],
  },
  messageChannel: {
    fieldStandardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.type,
    field: 'type',
    defaultValue: { fromDefaultValue: "'email'", toDefaultValue: "'EMAIL'" },
    options: [
      {
        fromOption: {
          value: 'email',
          label: 'Email',
          position: 0,
          color: 'green',
        },
        toOption: {
          value: 'EMAIL',
          label: 'Email',
          position: 0,
          color: 'green',
        },
      },
      {
        fromOption: { value: 'sms', label: 'SMS', position: 1, color: 'blue' },
        toOption: { value: 'SMS', label: 'SMS', position: 1, color: 'blue' },
      },
    ],
  },
  messageParticipant: {
    fieldStandardId: MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS.role,
    field: 'role',
    defaultValue: { fromDefaultValue: "'from'", toDefaultValue: "'FROM'" },
    options: [
      {
        fromOption: {
          value: 'from',
          label: 'From',
          position: 0,
          color: 'green',
        },
        toOption: { value: 'FROM', label: 'From', position: 0, color: 'green' },
      },
      {
        fromOption: { value: 'to', label: 'To', position: 1, color: 'blue' },
        toOption: { value: 'TO', label: 'To', position: 1, color: 'blue' },
      },
      {
        fromOption: { value: 'cc', label: 'Cc', position: 2, color: 'orange' },
        toOption: { value: 'CC', label: 'Cc', position: 2, color: 'orange' },
      },
      {
        fromOption: { value: 'bcc', label: 'Bcc', position: 3, color: 'red' },
        toOption: { value: 'BCC', label: 'Bcc', position: 3, color: 'red' },
      },
    ],
  },
  workspaceMember: {
    fieldStandardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.numberFormat,
    field: 'numberFormat',
    defaultValue: { fromDefaultValue: "'system'", toDefaultValue: "'SYSTEM'" },
    options: [
      {
        fromOption: {
          value: 'SYSTEM',
          label: 'System',
          position: 0,
          color: 'turquoise',
        },
        toOption: {
          value: 'SYSTEM',
          label: 'System',
          position: 0,
          color: 'turquoise',
        },
      },
      {
        fromOption: {
          value: 'COMMAS_AND_DOT',
          label: 'Commas and dot (1,234.56)',
          position: 1,
          color: 'blue',
        },
        toOption: {
          value: 'COMMAS_AND_DOT',
          label: 'Commas and dot',
          position: 1,
          color: 'blue',
        },
      },
      {
        fromOption: {
          value: 'SPACES_AND_COMMA',
          label: 'Spaces and comma (1 234,56)',
          position: 2,
          color: 'green',
        },
        toOption: {
          value: 'SPACES_AND_COMMA',
          label: 'Spaces and comma',
          position: 2,
          color: 'green',
        },
      },
      {
        fromOption: {
          value: 'DOTS_AND_COMMA',
          label: 'Dots and comma (1.234,56)',
          position: 3,
          color: 'orange',
        },
        toOption: {
          value: 'DOTS_AND_COMMA',
          label: 'Dots and comma',
          position: 3,
          color: 'orange',
        },
      },
      {
        fromOption: {
          value: 'APOSTROPHE_AND_DOT',
          label: "Apostrophe and dot (1'234.56)",
          position: 4,
          color: 'purple',
        },
        toOption: {
          value: 'APOSTROPHE_AND_DOT',
          label: 'Apostrophe and dot',
          position: 4,
          color: 'purple',
        },
      },
    ],
  },
} as const satisfies {
  [P in AllStandardObjectName]?: {
    fieldStandardId: string;
    field: AllStandardObjectFieldName<P>;
    options: FromTo<FieldMetadataComplexOption, 'option'>[];
    defaultValue: FromTo<string, 'defaultValue'>;
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
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
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
    const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatObjectMetadataMaps',
      ]);

    const flatCalendarEventObject = findStandardFlatObjectMetadataOrThrow({
      standardId: STANDARD_OBJECT_IDS.calendarEvent,
      flatObjectMetadataMaps,
    });

    const iCalUidFieldId = findStandardFlatFieldMetadatawOrThrow({
      flatFieldMetadataMaps,
      flatObjectMetadata: flatCalendarEventObject,
      standardId: CALENDAR_EVENT_STANDARD_FIELD_IDS.iCalUid,
    }).id;

    const allAffectedObjectNames = Object.keys(
      ENUM_FIELD_OPTIONS_TO_MUTATE,
    ).filter(isDefined) as (keyof typeof ENUM_FIELD_OPTIONS_TO_MUTATE)[];

    const flatEnumFieldMetadatasToUpdate = allAffectedObjectNames.flatMap<{
      id: string;
      options: FieldMetadataComplexOption[];
      defaultValue: FieldMetadataDefaultValue<FieldMetadataType.SELECT>;
    }>((objectName) => {
      const { defaultValue, field, options, fieldStandardId } =
        ENUM_FIELD_OPTIONS_TO_MUTATE[objectName];

      const objectStandardId = STANDARD_OBJECT_IDS[objectName];

      const flatObjectMetadata = findStandardFlatObjectMetadataOrThrow({
        flatObjectMetadataMaps,
        standardId: objectStandardId,
      });

      const flatFieldMetadata = findStandardFlatFieldMetadatawOrThrow({
        flatFieldMetadataMaps,
        flatObjectMetadata,
        standardId: fieldStandardId,
      });

      if (
        flatFieldMetadata.name !== field ||
        !isFlatFieldMetadataOfType(flatFieldMetadata, FieldMetadataType.SELECT)
      ) {
        throw new Error(
          `Retrieved flat field is not the one expected expected ${field} got ${flatFieldMetadata.name} in workspace ${workspaceId}`,
        );
      }

      const updatedOptions = flatFieldMetadata.options.map((option) => {
        const matchingNewOption = options.find(
          ({ fromOption }) => fromOption.value === option.value,
        );

        if (!isDefined(matchingNewOption)) {
          return option;
        }

        return {
          ...matchingNewOption.toOption,
          id: option.id,
        };
      });

      const updatedDefaultValue: FieldMetadataDefaultValue<FieldMetadataType.SELECT> =
        flatFieldMetadata.defaultValue === defaultValue.fromDefaultValue
          ? defaultValue.toDefaultValue
          : flatFieldMetadata.defaultValue;

      return {
        id: flatFieldMetadata.id,
        options: updatedOptions,
        defaultValue: updatedDefaultValue,
      };
    });

    const allUpdates = [
      {
        id: iCalUidFieldId,
        name: 'iCalUid',
      },
      ...flatEnumFieldMetadatasToUpdate,
    ];

    if (!isDryRun) {
      for (const updateFieldInput of allUpdates) {
        await this.fieldMetadataService.updateOneField({
          updateFieldInput,
          workspaceId,
          isSystemBuild: true,
        });
      }
    }
    this.logger.log('Migrated standard invalid entities');
  }
}
