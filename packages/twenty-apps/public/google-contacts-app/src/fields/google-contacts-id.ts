import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { GOOGLE_CONTACTS_ID_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: GOOGLE_CONTACTS_ID_FIELD_UNIVERSAL_IDENTIFIER,
  name: 'googleContactsId',
  label: 'Google Contacts ID',
  type: FieldType.TEXT,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  isUnique: true,
  isNullable: true,
  isUIEditable: false,
});
