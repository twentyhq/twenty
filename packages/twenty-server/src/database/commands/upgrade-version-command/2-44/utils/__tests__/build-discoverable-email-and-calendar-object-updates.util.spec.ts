import { STANDARD_OBJECT_FIELDS, STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability } from 'twenty-shared/types';

import { DISCOVERABLE_EMAIL_AND_CALENDAR_OBJECTS } from 'src/database/commands/upgrade-version-command/2-44/constants/discoverable-email-and-calendar-objects.constant';
import {
  buildDiscoverableEmailAndCalendarObjectUpdates,
  buildRevertedEmailAndCalendarObjectUpdates,
} from 'src/database/commands/upgrade-version-command/2-44/utils/build-discoverable-email-and-calendar-object-updates.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const INHERITED_TARGET_PARENT_FIELDS: Record<string, string[]> = {
  [STANDARD_OBJECTS.messageThreadTarget.universalIdentifier]: [
    STANDARD_OBJECT_FIELDS.messageThreadTarget.messageThread
      .universalIdentifier,
  ],
  [STANDARD_OBJECTS.calendarEventTarget.universalIdentifier]: [
    STANDARD_OBJECT_FIELDS.calendarEventTarget.calendarEvent
      .universalIdentifier,
  ],
};

const buildFlatObjectMetadataMaps = (
  flatObjectMetadatas: FlatObjectMetadata[],
) =>
  ({
    byUniversalIdentifier: Object.fromEntries(
      flatObjectMetadatas.map((flatObjectMetadata) => [
        flatObjectMetadata.universalIdentifier,
        flatObjectMetadata,
      ]),
    ),
  }) as unknown as FlatEntityMaps<FlatObjectMetadata>;

const buildWorkspace = ({
  missingFieldUniversalIdentifiers = [],
}: { missingFieldUniversalIdentifiers?: string[] } = {}) => {
  const flatObjectMetadatas = DISCOVERABLE_EMAIL_AND_CALENDAR_OBJECTS.map(
    ({ universalIdentifier }) =>
      getFlatObjectMetadataMock({
        universalIdentifier,
        id: `${universalIdentifier}-id`,
        ...(universalIdentifier in INHERITED_TARGET_PARENT_FIELDS && {
          readability: MetadataReadability.INHERITED,
          readabilityParentFieldUniversalIdentifiers:
            INHERITED_TARGET_PARENT_FIELDS[universalIdentifier],
        }),
      }),
  );

  const flatFieldMetadataMaps = {
    byUniversalIdentifier: Object.fromEntries(
      DISCOVERABLE_EMAIL_AND_CALENDAR_OBJECTS.flatMap(
        ({ universalIdentifier, discoverableFieldUniversalIdentifiers }) =>
          discoverableFieldUniversalIdentifiers
            .filter(
              (fieldUniversalIdentifier) =>
                !missingFieldUniversalIdentifiers.includes(
                  fieldUniversalIdentifier,
                ),
            )
            .map((fieldUniversalIdentifier) => [
              fieldUniversalIdentifier,
              { objectMetadataId: `${universalIdentifier}-id` },
            ]),
      ),
    ),
  } as unknown as FlatEntityMaps<FlatFieldMetadata>;

  return {
    flatObjectMetadataMaps: buildFlatObjectMetadataMaps(flatObjectMetadatas),
    flatFieldMetadataMaps,
  };
};

const findUpdate = (
  updates: FlatObjectMetadata[],
  universalIdentifier: string,
) =>
  updates.find(
    (update) => update.universalIdentifier === universalIdentifier,
  );

describe('buildDiscoverableEmailAndCalendarObjectUpdates', () => {
  it('makes threads and events discoverable and messages inherit their thread', () => {
    const updates = buildDiscoverableEmailAndCalendarObjectUpdates(
      buildWorkspace(),
    );

    expect(updates).toHaveLength(5);
    expect(
      findUpdate(updates, STANDARD_OBJECTS.messageThread.universalIdentifier),
    ).toMatchObject({
      readability: MetadataReadability.DISCOVERABLE,
      readabilityParentFieldUniversalIdentifiers: null,
    });
    expect(
      findUpdate(updates, STANDARD_OBJECTS.calendarEvent.universalIdentifier),
    ).toMatchObject({ readability: MetadataReadability.DISCOVERABLE });
    expect(
      findUpdate(updates, STANDARD_OBJECTS.message.universalIdentifier),
    ).toMatchObject({
      readability: MetadataReadability.INHERITED,
      readabilityParentFieldUniversalIdentifiers: [
        STANDARD_OBJECT_FIELDS.message.messageThread.universalIdentifier,
      ],
    });
  });

  it('keeps target readability and only declares their discoverable fields', () => {
    const updates = buildDiscoverableEmailAndCalendarObjectUpdates(
      buildWorkspace(),
    );

    expect(
      findUpdate(
        updates,
        STANDARD_OBJECTS.messageThreadTarget.universalIdentifier,
      ),
    ).toMatchObject({
      readability: MetadataReadability.INHERITED,
      readabilityParentFieldUniversalIdentifiers: [
        STANDARD_OBJECT_FIELDS.messageThreadTarget.messageThread
          .universalIdentifier,
      ],
      discoverableFieldUniversalIdentifiers: [
        STANDARD_OBJECT_FIELDS.messageThreadTarget.messageThread
          .universalIdentifier,
        STANDARD_OBJECT_FIELDS.messageThreadTarget.targetPerson
          .universalIdentifier,
      ],
    });
  });

  it('leaves out declared fields the workspace does not have', () => {
    const callRecordings =
      STANDARD_OBJECT_FIELDS.calendarEvent.callRecordings.universalIdentifier;

    const calendarEventUpdate = findUpdate(
      buildDiscoverableEmailAndCalendarObjectUpdates(
        buildWorkspace({ missingFieldUniversalIdentifiers: [callRecordings] }),
      ),
      STANDARD_OBJECTS.calendarEvent.universalIdentifier,
    );

    expect(
      calendarEventUpdate?.discoverableFieldUniversalIdentifiers,
    ).not.toContain(callRecordings);
    expect(
      calendarEventUpdate?.discoverableFieldUniversalIdentifiers,
    ).toContain(
      STANDARD_OBJECT_FIELDS.calendarEvent.startsAt.universalIdentifier,
    );
  });

  it('updates nothing once the objects are up to date', () => {
    const workspace = buildWorkspace();

    const updatedWorkspace = {
      ...workspace,
      flatObjectMetadataMaps: buildFlatObjectMetadataMaps(
        buildDiscoverableEmailAndCalendarObjectUpdates(workspace),
      ),
    };

    expect(
      buildDiscoverableEmailAndCalendarObjectUpdates(updatedWorkspace),
    ).toEqual([]);
  });
});

describe('buildRevertedEmailAndCalendarObjectUpdates', () => {
  it('opens threads, events and messages again and clears discoverable fields', () => {
    const workspace = buildWorkspace();

    const updates = buildRevertedEmailAndCalendarObjectUpdates({
      flatObjectMetadataMaps: buildFlatObjectMetadataMaps(
        buildDiscoverableEmailAndCalendarObjectUpdates(workspace),
      ),
    });

    expect(
      updates.map(
        ({
          universalIdentifier,
          readability,
          readabilityParentFieldUniversalIdentifiers,
          discoverableFieldUniversalIdentifiers,
        }) => ({
          universalIdentifier,
          readability,
          readabilityParentFieldUniversalIdentifiers,
          discoverableFieldUniversalIdentifiers,
        }),
      ),
    ).toEqual([
      {
        universalIdentifier: STANDARD_OBJECTS.messageThread.universalIdentifier,
        readability: MetadataReadability.OPEN,
        readabilityParentFieldUniversalIdentifiers: null,
        discoverableFieldUniversalIdentifiers: null,
      },
      {
        universalIdentifier:
          STANDARD_OBJECTS.messageThreadTarget.universalIdentifier,
        readability: MetadataReadability.INHERITED,
        readabilityParentFieldUniversalIdentifiers:
          INHERITED_TARGET_PARENT_FIELDS[
            STANDARD_OBJECTS.messageThreadTarget.universalIdentifier
          ],
        discoverableFieldUniversalIdentifiers: null,
      },
      {
        universalIdentifier: STANDARD_OBJECTS.message.universalIdentifier,
        readability: MetadataReadability.OPEN,
        readabilityParentFieldUniversalIdentifiers: null,
        discoverableFieldUniversalIdentifiers: null,
      },
      {
        universalIdentifier: STANDARD_OBJECTS.calendarEvent.universalIdentifier,
        readability: MetadataReadability.OPEN,
        readabilityParentFieldUniversalIdentifiers: null,
        discoverableFieldUniversalIdentifiers: null,
      },
      {
        universalIdentifier:
          STANDARD_OBJECTS.calendarEventTarget.universalIdentifier,
        readability: MetadataReadability.INHERITED,
        readabilityParentFieldUniversalIdentifiers:
          INHERITED_TARGET_PARENT_FIELDS[
            STANDARD_OBJECTS.calendarEventTarget.universalIdentifier
          ],
        discoverableFieldUniversalIdentifiers: null,
      },
    ]);
  });
});
