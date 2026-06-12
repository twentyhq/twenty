import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { TRANSCRIPT_ON_CALENDAR_EVENT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: TRANSCRIPT_ON_CALENDAR_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.calendarEvent.universalIdentifier,
  type: FieldType.RICH_TEXT,
  name: 'transcript',
  label: 'Transcript',
  description:
    'Call transcript synced from Fireflies. Populated automatically when a Fireflies recording finishes processing and matches this calendar event.',
  icon: 'IconMicrophone',
  isNullable: true,
});
