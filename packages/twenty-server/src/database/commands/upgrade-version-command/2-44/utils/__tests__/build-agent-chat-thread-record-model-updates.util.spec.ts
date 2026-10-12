import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataWritability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { buildAgentChatThreadRecordModelUpdates } from 'src/database/commands/upgrade-version-command/2-44/utils/build-agent-chat-thread-record-model-updates.util';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const NOW = '2026-09-29T12:00:00.000Z';
const CHAT_FIELDS = STANDARD_OBJECTS.agentChatThread.fields;

const { allFlatEntityMaps } = computeTwentyStandardApplicationAllFlatEntityMaps(
  {
    now: '2026-09-27T12:00:00.000Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  },
);

const getStandard = <TEntity extends SyncableFlatEntity>(
  maps: FlatEntityMaps<TEntity>,
  universalIdentifier: string,
) => {
  const entity = maps.byUniversalIdentifier[universalIdentifier];

  if (!isDefined(entity)) {
    throw new Error(`Standard entity ${universalIdentifier} missing`);
  }

  return entity;
};

const chatObject = getStandard<FlatObjectMetadata>(
  allFlatEntityMaps.flatObjectMetadataMaps,
  STANDARD_OBJECTS.agentChatThread.universalIdentifier,
);
const idField = getStandard<FlatFieldMetadata>(
  allFlatEntityMaps.flatFieldMetadataMaps,
  CHAT_FIELDS.id.universalIdentifier,
);
const titleField = getStandard<FlatFieldMetadata>(
  allFlatEntityMaps.flatFieldMetadataMaps,
  CHAT_FIELDS.title.universalIdentifier,
);
const archivedAtField = getStandard<FlatFieldMetadata>(
  allFlatEntityMaps.flatFieldMetadataMaps,
  CHAT_FIELDS.archivedAt.universalIdentifier,
);

const buildMaps = ({
  object,
  fields,
}: {
  object: FlatObjectMetadata;
  fields: FlatFieldMetadata[];
}) => ({
  flatObjectMetadataMaps: {
    ...allFlatEntityMaps.flatObjectMetadataMaps,
    byUniversalIdentifier: { [object.universalIdentifier]: object },
  },
  flatFieldMetadataMaps: {
    ...allFlatEntityMaps.flatFieldMetadataMaps,
    byUniversalIdentifier: Object.fromEntries(
      fields.map((field) => [field.universalIdentifier, field]),
    ),
  },
});

const previousChatObject: FlatObjectMetadata = {
  ...chatObject,
  labelSingular: 'Agent chat thread',
  labelPlural: 'Agent chat threads',
  isUIEditable: false,
  labelIdentifierFieldMetadataId: idField.id,
  labelIdentifierFieldMetadataUniversalIdentifier: idField.universalIdentifier,
};
const previousFields = [
  idField,
  { ...titleField, isUIEditable: false },
  { ...archivedAtField, writability: MetadataWritability.OPEN },
];

describe('buildAgentChatThreadRecordModelUpdates', () => {
  it('names chats, identifies them by title and locks the archive column', () => {
    const { objectToUpdate, fieldsToUpdate } =
      buildAgentChatThreadRecordModelUpdates({
        ...buildMaps({ object: previousChatObject, fields: previousFields }),
        now: NOW,
        direction: 'up',
      });

    expect(objectToUpdate).toMatchObject({
      labelSingular: 'Chat',
      labelPlural: 'Chats',
      isUIEditable: true,
      labelIdentifierFieldMetadataId: titleField.id,
      labelIdentifierFieldMetadataUniversalIdentifier:
        titleField.universalIdentifier,
    });
    expect(fieldsToUpdate).toEqual([
      expect.objectContaining({
        universalIdentifier: titleField.universalIdentifier,
        isUIEditable: true,
      }),
      expect.objectContaining({
        universalIdentifier: archivedAtField.universalIdentifier,
        writability: MetadataWritability.SYSTEM,
      }),
    ]);
  });

  it('matches the standard definition once applied', () => {
    expect(
      buildAgentChatThreadRecordModelUpdates({
        ...buildMaps({
          object: chatObject,
          fields: [idField, titleField, archivedAtField],
        }),
        now: NOW,
        direction: 'up',
      }),
    ).toEqual({ objectToUpdate: undefined, fieldsToUpdate: [] });
  });

  it('restores the previous shape on down', () => {
    const { objectToUpdate, fieldsToUpdate } =
      buildAgentChatThreadRecordModelUpdates({
        ...buildMaps({
          object: chatObject,
          fields: [idField, titleField, archivedAtField],
        }),
        now: NOW,
        direction: 'down',
      });

    expect(objectToUpdate).toMatchObject({
      labelSingular: 'Agent chat thread',
      isUIEditable: false,
      labelIdentifierFieldMetadataId: idField.id,
    });
    expect(fieldsToUpdate).toHaveLength(2);
  });
});
