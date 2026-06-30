import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { LAST_HEARD_FROM_AT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: LAST_HEARD_FROM_AT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  name: 'lastHeardFromAt',
  type: FieldType.DATE_TIME,
  label: 'Last heard from',
  description:
    'When you last heard from this person (an inbound email, or a meeting they organized).',
  icon: 'IconMessageDots',
  isNullable: true,
});
