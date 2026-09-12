import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { CALL_RECORDING_MEDIA_EXPIRES_AT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    CALL_RECORDING_MEDIA_EXPIRES_AT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.callRecording.universalIdentifier,
  type: FieldType.DATE_TIME,
  name: 'mediaExpiresAt',
  label: 'Media Expires At',
  description:
    'When Recall deletes this recording’s media. Artifacts not imported by then are recorded as expired.',
  icon: 'IconClock',
  isNullable: true,
  isUIEditable: false,
});
