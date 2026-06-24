import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { SUMMARY_ON_CALENDAR_EVENT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: SUMMARY_ON_CALENDAR_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.calendarEvent.universalIdentifier,
  type: FieldType.RICH_TEXT,
  name: 'summary',
  label: 'Summary',
  description:
    'AI-generated meeting summary synced from Fireflies. Includes overview, action items, and keywords. Populated automatically when Fireflies finishes summarizing a recording that matches this calendar event.',
  icon: 'IconNotes',
  isNullable: true,
});
