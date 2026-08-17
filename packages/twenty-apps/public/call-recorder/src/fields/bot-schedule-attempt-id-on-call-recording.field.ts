import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { BOT_SCHEDULE_ATTEMPT_ID_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/bot-schedule-attempt-id-field-universal-identifier';

export default defineField({
  universalIdentifier: BOT_SCHEDULE_ATTEMPT_ID_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.callRecording.universalIdentifier,
  type: FieldType.TEXT,
  name: 'botScheduleAttemptId',
  label: 'Bot Schedule Attempt ID',
  description:
    'Durable identity of one Recall bot scheduling attempt, shared with Recall metadata so stale lifecycle events cannot target a replacement bot.',
  icon: 'IconFingerprint',
  isNullable: true,
  isUIEditable: false,
});
