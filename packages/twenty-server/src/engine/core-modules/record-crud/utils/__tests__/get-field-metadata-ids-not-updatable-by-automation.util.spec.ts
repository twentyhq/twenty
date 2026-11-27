import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

import { getFieldMetadataIdsNotUpdatableByAutomation } from 'src/engine/core-modules/record-crud/utils/get-field-metadata-ids-not-updatable-by-automation.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const calendarEventTitle = getFlatFieldMetadataMock({
  universalIdentifier: 'calendar-event-title',
  objectMetadataId: 'calendarEvent',
  type: FieldMetadataType.TEXT,
  name: 'title',
  applicationUniversalIdentifier:
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
});

const calendarEventBrief = getFlatFieldMetadataMock({
  universalIdentifier: 'calendar-event-brief',
  objectMetadataId: 'calendarEvent',
  type: FieldMetadataType.RICH_TEXT,
  name: 'brief',
  applicationUniversalIdentifier: 'installed-application',
});

const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> = {
  byUniversalIdentifier: {
    [calendarEventTitle.universalIdentifier]: calendarEventTitle,
    [calendarEventBrief.universalIdentifier]: calendarEventBrief,
  },
  universalIdentifierById: {
    [calendarEventTitle.id]: calendarEventTitle.universalIdentifier,
    [calendarEventBrief.id]: calendarEventBrief.universalIdentifier,
  },
  universalIdentifiersByApplicationId: {},
};

describe('getFieldMetadataIdsNotUpdatableByAutomation', () => {
  it('should list the standard fields of an object synced from connected accounts', () => {
    expect(
      getFieldMetadataIdsNotUpdatableByAutomation({
        flatObjectMetadata: {
          nameSingular: 'calendarEvent',
          fieldIds: [calendarEventTitle.id, calendarEventBrief.id],
        },
        flatFieldMetadataMaps,
      }),
    ).toEqual([calendarEventTitle.id]);
  });

  it('should list every field of an object blocked from automation', () => {
    expect(
      getFieldMetadataIdsNotUpdatableByAutomation({
        flatObjectMetadata: {
          nameSingular: 'workflowRun',
          fieldIds: [calendarEventTitle.id, calendarEventBrief.id],
        },
        flatFieldMetadataMaps,
      }),
    ).toEqual([calendarEventTitle.id, calendarEventBrief.id]);
  });

  it('should list no field on other objects', () => {
    expect(
      getFieldMetadataIdsNotUpdatableByAutomation({
        flatObjectMetadata: {
          nameSingular: 'company',
          fieldIds: [calendarEventTitle.id],
        },
        flatFieldMetadataMaps,
      }),
    ).toEqual([]);
  });
});
