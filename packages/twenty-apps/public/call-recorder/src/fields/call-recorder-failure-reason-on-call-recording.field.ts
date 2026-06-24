import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { CALL_RECORDER_FAILURE_REASON_ON_CALL_RECORDING_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recorder-failure-reason-on-call-recording-field-universal-identifier';

export default defineField({
  universalIdentifier:
    CALL_RECORDER_FAILURE_REASON_ON_CALL_RECORDING_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.callRecording.universalIdentifier,
  type: FieldType.TEXT,
  name: 'callRecorderFailureReason',
  label: 'Call Recorder Failure Reason',
  description:
    'Provider-specific reason the call recorder could not produce a recording.',
  icon: 'IconAlertTriangle',
  isNullable: true,
  isUIEditable: false,
});
