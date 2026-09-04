import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { FATHOM_MEDIA_IMPORT_CLAIMED_AT_ON_CALL_RECORDING_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    FATHOM_MEDIA_IMPORT_CLAIMED_AT_ON_CALL_RECORDING_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.callRecording.universalIdentifier,
  type: FieldType.DATE_TIME,
  name: 'fathomMediaImportClaimedAt',
  label: 'Fathom Media Import Claimed At',
  description:
    'Expiring lease held by the worker importing media for this Fathom recording.',
  icon: 'IconLock',
  isNullable: true,
  isUIEditable: false,
});
