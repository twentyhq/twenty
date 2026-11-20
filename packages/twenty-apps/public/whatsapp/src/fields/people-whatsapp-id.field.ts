import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import {WHATSAPP_ID_PEOPLE_FIELD_UNIVERSAL_IDENTIFIER} from "src/constants/universal-identifiers";

export default defineField({
  universalIdentifier: WHATSAPP_ID_PEOPLE_FIELD_UNIVERSAL_IDENTIFIER,
  name: 'whatsAppId',
  label: 'WhatsApp ID',
  description: 'WhatsApp ID used to find people in group conversations',
  type: FieldType.TEXT,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  isNullable: true,
  isUnique: true,
});
