import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { MESSENGER_REFERRAL_REF_PERSON_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: MESSENGER_REFERRAL_REF_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  name: 'messengerReferralRef',
  label: 'Messenger referral ref',
  description:
    'The ref parameter of the last ad or m.me link that brought the person into Messenger',
  type: FieldType.TEXT,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  isNullable: true,
});
