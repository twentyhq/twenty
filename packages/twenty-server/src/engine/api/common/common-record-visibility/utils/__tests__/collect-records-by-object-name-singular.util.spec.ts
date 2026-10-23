import {
  FieldMetadataType,
  type ObjectRecord,
  RelationType,
} from 'twenty-shared/types';

import { collectRecordsByObjectNameSingular } from 'src/engine/api/common/common-record-visibility/utils/collect-records-by-object-name-singular.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const buildFlatEntityMaps = <
  TFlatEntity extends FlatFieldMetadata | FlatObjectMetadata,
>(
  flatEntities: TFlatEntity[],
): FlatEntityMaps<TFlatEntity> =>
  flatEntities.reduce(
    (flatEntityMaps, flatEntity) =>
      addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
    createEmptyFlatEntityMaps() as FlatEntityMaps<TFlatEntity>,
  );

const participantsField = getFlatFieldMetadataMock({
  universalIdentifier: 'person-calendar-event-participants',
  objectMetadataId: 'person',
  type: FieldMetadataType.RELATION,
  name: 'calendarEventParticipants',
  settings: { relationType: RelationType.ONE_TO_MANY },
  relationTargetObjectMetadataId: 'calendarEventParticipant',
});

const calendarEventField = getFlatFieldMetadataMock({
  universalIdentifier: 'calendar-event-participant-calendar-event',
  objectMetadataId: 'calendarEventParticipant',
  type: FieldMetadataType.RELATION,
  name: 'calendarEvent',
  settings: { relationType: RelationType.MANY_TO_ONE },
  relationTargetObjectMetadataId: 'calendarEvent',
});

const person = getFlatObjectMetadataMock({
  id: 'person',
  universalIdentifier: 'person',
  nameSingular: 'person',
  fieldIds: [participantsField.id],
});

const calendarEventParticipant = getFlatObjectMetadataMock({
  id: 'calendarEventParticipant',
  universalIdentifier: 'calendarEventParticipant',
  nameSingular: 'calendarEventParticipant',
  fieldIds: [calendarEventField.id],
});

const calendarEvent = getFlatObjectMetadataMock({
  id: 'calendarEvent',
  universalIdentifier: 'calendarEvent',
  nameSingular: 'calendarEvent',
  fieldIds: [],
});

const collect = ({
  records,
  flatObjectMetadata,
  objectNameSingulars,
}: {
  records: ObjectRecord[];
  flatObjectMetadata: FlatObjectMetadata;
  objectNameSingulars: string[];
}) =>
  collectRecordsByObjectNameSingular({
    records,
    flatObjectMetadata,
    flatObjectMetadataMaps: buildFlatEntityMaps([
      person,
      calendarEventParticipant,
      calendarEvent,
    ]),
    flatFieldMetadataMaps: buildFlatEntityMaps([
      participantsField,
      calendarEventField,
    ]),
    objectNameSingulars: new Set(objectNameSingulars),
  });

describe('collectRecordsByObjectNameSingular', () => {
  it('should collect root records of a requested object', () => {
    const event: ObjectRecord = { id: 'event-1', title: 'Demo' };

    expect(
      collect({
        records: [event],
        flatObjectMetadata: calendarEvent,
        objectNameSingulars: ['calendarEvent'],
      }),
    ).toEqual(new Map([['calendarEvent', [event]]]));
  });

  it('should collect records nested through one-to-many and many-to-one relations', () => {
    const firstEvent = { id: 'event-1', title: 'Demo' };
    const secondEvent = { id: 'event-2', title: 'Sync' };

    const records: ObjectRecord[] = [
      {
        id: 'person-1',
        calendarEventParticipants: [
          { id: 'participant-1', calendarEvent: firstEvent },
          { id: 'participant-2', calendarEvent: secondEvent },
          { id: 'participant-3', calendarEvent: null },
        ],
      },
    ];

    const collectedRecords = collect({
      records,
      flatObjectMetadata: person,
      objectNameSingulars: ['calendarEvent'],
    });

    expect(collectedRecords.get('calendarEvent')).toEqual([
      firstEvent,
      secondEvent,
    ]);
    expect(collectedRecords.has('person')).toBe(false);
  });

  it('should collect a record shared by several parents once', () => {
    const sharedEvent = { id: 'event-1', title: 'Demo' };

    const records: ObjectRecord[] = [
      {
        id: 'person-1',
        calendarEventParticipants: [
          { id: 'participant-1', calendarEvent: sharedEvent },
          { id: 'participant-2', calendarEvent: sharedEvent },
        ],
      },
    ];

    expect(
      collect({
        records,
        flatObjectMetadata: person,
        objectNameSingulars: ['calendarEvent'],
      }).get('calendarEvent'),
    ).toEqual([sharedEvent]);
  });

  it('should collect nothing when no requested object is in the result', () => {
    const records: ObjectRecord[] = [
      { id: 'person-1', calendarEventParticipants: [] },
    ];

    expect(
      collect({
        records,
        flatObjectMetadata: person,
        objectNameSingulars: ['message'],
      }).size,
    ).toBe(0);
  });
});
