import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { MESSENGER_REFERRAL_SOURCE_PERSON_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: MESSENGER_REFERRAL_SOURCE_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  name: 'messengerReferralSource',
  label: 'Messenger referral source',
  description:
    'Where the person last came from into Messenger: ADS for a Click-to-Messenger ad, SHORTLINK for an m.me link',
  type: FieldType.TEXT,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  isNullable: true,
});
