import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { LAST_INBOUND_AT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: LAST_INBOUND_AT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  name: 'lastInboundAt',
  type: FieldType.DATE_TIME,
  label: 'Last inbound',
  description:
    'When this person last reached out to you (an inbound email, or a meeting they organized).',
  icon: 'IconMessageDown',
  isNullable: true,
  isUIEditable: false,
});
