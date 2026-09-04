import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { FATHOM_MEDIA_FAILURE_REASON_ON_CALL_RECORDING_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    FATHOM_MEDIA_FAILURE_REASON_ON_CALL_RECORDING_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.callRecording.universalIdentifier,
  type: FieldType.TEXT,
  name: 'fathomMediaFailureReason',
  label: 'Fathom Media Failure Reason',
  description:
    'Why Fathom could not supply the video or audio of this recording.',
  icon: 'IconAlertTriangle',
  isNullable: true,
  isUIEditable: false,
});
