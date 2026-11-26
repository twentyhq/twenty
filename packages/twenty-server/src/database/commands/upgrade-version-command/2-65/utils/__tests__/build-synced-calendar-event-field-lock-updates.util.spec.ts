import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { buildSyncedCalendarEventFieldLockUpdates } from 'src/database/commands/upgrade-version-command/2-65/utils/build-synced-calendar-event-field-lock-updates.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const { fields } = STANDARD_OBJECTS.calendarEvent;

const buildField = ({
  universalIdentifier,
  disabledFieldPermissionActions,
}: Pick<
  FlatFieldMetadata,
  'universalIdentifier' | 'disabledFieldPermissionActions'
>): Pick<
  FlatFieldMetadata,
  'universalIdentifier' | 'disabledFieldPermissionActions' | 'updatedAt'
> => ({
  universalIdentifier,
  disabledFieldPermissionActions,
  updatedAt: '2026-01-01T00:00:00.000Z',
});

describe('buildSyncedCalendarEventFieldLockUpdates', () => {
  it('should lock synced fields that are not locked yet and leave the others alone', () => {
    const updates = buildSyncedCalendarEventFieldLockUpdates({
      flatFieldMetadataMaps: {
        byUniversalIdentifier: {
          [fields.title.universalIdentifier]: buildField({
            universalIdentifier: fields.title.universalIdentifier,
            disabledFieldPermissionActions: null,
          }),
          [fields.location.universalIdentifier]: buildField({
            universalIdentifier: fields.location.universalIdentifier,
            disabledFieldPermissionActions: ['canUpdateFieldValue'],
          }),
          [fields.calendarEventTargets.universalIdentifier]: buildField({
            universalIdentifier:
              fields.calendarEventTargets.universalIdentifier,
            disabledFieldPermissionActions: null,
          }),
        },
      },
      now: '2026-11-26T00:00:00.000Z',
    });

    expect(
      updates.map(
        ({ universalIdentifier, disabledFieldPermissionActions }) => ({
          universalIdentifier,
          disabledFieldPermissionActions,
        }),
      ),
    ).toEqual([
      {
        universalIdentifier: fields.title.universalIdentifier,
        disabledFieldPermissionActions: ['canUpdateFieldValue'],
      },
    ]);
  });
});
