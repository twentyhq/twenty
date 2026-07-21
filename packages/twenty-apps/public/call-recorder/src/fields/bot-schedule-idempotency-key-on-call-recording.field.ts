import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { BOT_SCHEDULE_IDEMPOTENCY_KEY_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/bot-schedule-idempotency-key-field-universal-identifier';

export default defineField({
  universalIdentifier: BOT_SCHEDULE_IDEMPOTENCY_KEY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.callRecording.universalIdentifier,
  type: FieldType.TEXT,
  name: 'botScheduleIdempotencyKey',
  label: 'Bot Schedule Idempotency Key',
  description:
    'Idempotency key of the last Recall bot creation attempt; when the scheduling inputs still hash to this key, recovery can safely re-send the creation instead of listing bots.',
  icon: 'IconKey',
  isNullable: true,
  isUIEditable: false,
});
