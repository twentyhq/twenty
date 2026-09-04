import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { FATHOM_CONNECTED_ACCOUNT_ID_ON_CALL_RECORDING_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    FATHOM_CONNECTED_ACCOUNT_ID_ON_CALL_RECORDING_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.callRecording.universalIdentifier,
  type: FieldType.TEXT,
  name: 'fathomConnectedAccountId',
  label: 'Fathom Connected Account ID',
  description:
    'Connected account that owns the private Fathom download for this recording.',
  icon: 'IconLink',
  isNullable: true,
  isUIEditable: false,
});
