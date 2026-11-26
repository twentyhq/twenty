import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const { fields: calendarEventFields } = STANDARD_OBJECTS.calendarEvent;

const SYNCED_CALENDAR_EVENT_FIELD_UNIVERSAL_IDENTIFIERS = [
  calendarEventFields.title,
  calendarEventFields.isCanceled,
  calendarEventFields.isFullDay,
  calendarEventFields.startsAt,
  calendarEventFields.endsAt,
  calendarEventFields.externalCreatedAt,
  calendarEventFields.externalUpdatedAt,
  calendarEventFields.description,
  calendarEventFields.location,
  calendarEventFields.iCalUid,
  calendarEventFields.conferenceSolution,
  calendarEventFields.conferenceLink,
].map(({ universalIdentifier }) => universalIdentifier);

export const buildSyncedCalendarEventFieldLockUpdates = <
  TField extends Pick<
    FlatFieldMetadata,
    'disabledFieldPermissionActions' | 'updatedAt'
  >,
>({
  flatFieldMetadataMaps,
  now,
}: {
  flatFieldMetadataMaps: {
    byUniversalIdentifier: Partial<Record<string, TField>>;
  };
  now: string;
}): TField[] =>
  SYNCED_CALENDAR_EVENT_FIELD_UNIVERSAL_IDENTIFIERS.map(
    (universalIdentifier) =>
      flatFieldMetadataMaps.byUniversalIdentifier[universalIdentifier],
  )
    .filter(isDefined)
    .filter(
      ({ disabledFieldPermissionActions }) =>
        !(disabledFieldPermissionActions ?? []).includes('canUpdateFieldValue'),
    )
    .map((flatFieldMetadata) => ({
      ...flatFieldMetadata,
      disabledFieldPermissionActions: [
        ...(flatFieldMetadata.disabledFieldPermissionActions ?? []),
        'canUpdateFieldValue',
      ],
      updatedAt: now,
    }));
