import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { MESSENGER_REFERRED_AT_PERSON_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: MESSENGER_REFERRED_AT_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  name: 'messengerReferredAt',
  label: 'Messenger referred at',
  description:
    'When the last ad or m.me link brought the person into Messenger',
  type: FieldType.DATE_TIME,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  isNullable: true,
});
