import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { INTERACTION_COUNT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: INTERACTION_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.NUMBER,
  name: 'interactionCount',
  label: 'Interaction count',
  description:
    'The number of unique synced emails and completed meetings with this person.',
  icon: 'IconArrowsExchange',
  isNullable: false,
  defaultValue: 0,
  isUIEditable: false,
});
