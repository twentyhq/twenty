import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { MEETING_BOT_FAILURE_REASON_ON_CALL_RECORDING_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/meeting-bot-failure-reason-on-call-recording-field-universal-identifier';

export default defineField({
  universalIdentifier:
    MEETING_BOT_FAILURE_REASON_ON_CALL_RECORDING_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.callRecording.universalIdentifier,
  type: FieldType.TEXT,
  name: 'meetingBotFailureReason',
  label: 'Meeting Bot Failure Reason',
  description:
    'Provider-specific reason the meeting bot could not produce a recording.',
  icon: 'IconAlertTriangle',
  isNullable: true,
  isUIEditable: false,
});
