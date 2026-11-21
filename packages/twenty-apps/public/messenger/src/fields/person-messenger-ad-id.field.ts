import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { MESSENGER_AD_ID_PERSON_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: MESSENGER_AD_ID_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  name: 'messengerAdId',
  label: 'Messenger ad ID',
  description:
    'ID of the last Click-to-Messenger ad the person clicked',
  type: FieldType.TEXT,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  isNullable: true,
});
