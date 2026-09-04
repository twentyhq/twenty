import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { FATHOM_MEDIA_DOWNLOAD_ID_ON_CALL_RECORDING_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    FATHOM_MEDIA_DOWNLOAD_ID_ON_CALL_RECORDING_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.callRecording.universalIdentifier,
  type: FieldType.TEXT,
  name: 'fathomMediaDownloadId',
  label: 'Fathom Media Download ID',
  description: 'Active asynchronous Fathom download for this recording.',
  icon: 'IconDownload',
  isNullable: true,
  isUIEditable: false,
});
