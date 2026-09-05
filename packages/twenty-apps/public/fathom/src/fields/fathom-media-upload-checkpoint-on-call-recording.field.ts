import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { FATHOM_MEDIA_UPLOAD_CHECKPOINT_ON_CALL_RECORDING_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    FATHOM_MEDIA_UPLOAD_CHECKPOINT_ON_CALL_RECORDING_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.callRecording.universalIdentifier,
  type: FieldType.RAW_JSON,
  name: 'fathomMediaUploadCheckpoint',
  label: 'Fathom Media Upload Checkpoint',
  description: 'Completed Fathom upload awaiting attachment to this recording.',
  icon: 'IconUpload',
  isNullable: true,
  isUIEditable: false,
});
