import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { GRANOLA_NOTE_UPDATED_AT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: GRANOLA_NOTE_UPDATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.callRecording.universalIdentifier,
  name: 'granolaNoteUpdatedAt',
  type: FieldType.TEXT,
  label: 'Granola note version',
  description:
    'Last-edited timestamp of the Granola note version fully imported into this recording.',
  icon: 'IconCalendarClock',
  isNullable: true,
  isUIEditable: false,
});
