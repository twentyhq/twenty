import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { BOT_SCHEDULE_ATTEMPTED_AT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/bot-schedule-attempted-at-field-universal-identifier';

export default defineField({
  universalIdentifier: BOT_SCHEDULE_ATTEMPTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.callRecording.universalIdentifier,
  type: FieldType.DATE_TIME,
  name: 'botScheduleAttemptedAt',
  label: 'Bot Schedule Attempted At',
  description:
    'Set right before a Recall bot creation request is sent; recovery uses it to tell rows that never reached Recall from rows whose creation outcome is unknown.',
  icon: 'IconClockPlay',
  isNullable: true,
  isUIEditable: false,
});
