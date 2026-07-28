import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { LAST_OUTBOUND_AT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: LAST_OUTBOUND_AT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  name: 'lastOutboundAt',
  type: FieldType.DATE_TIME,
  label: 'Last outbound',
  description:
    'When your team last reached out to this person (an outbound email, or a meeting your team organized).',
  icon: 'IconMessageUp',
  isNullable: true,
  isUIEditable: false,
});
