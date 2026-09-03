import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { CALL_RECORDING_ARTIFACTS_IMPORT_CLAIMED_AT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    CALL_RECORDING_ARTIFACTS_IMPORT_CLAIMED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.callRecording.universalIdentifier,
  type: FieldType.DATE_TIME,
  name: 'artifactsImportClaimedAt',
  label: 'Artifacts Import Claimed At',
  description:
    'Lease held by the worker importing this recording’s artifacts; prevents concurrent webhook retries from duplicating provider imports.',
  icon: 'IconLock',
  isNullable: true,
  isUIEditable: false,
});
