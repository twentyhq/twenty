import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { WHATSAPP_MARKETING_PREFERENCE_UPDATED_AT_PEOPLE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: WHATSAPP_MARKETING_PREFERENCE_UPDATED_AT_PEOPLE_FIELD_UNIVERSAL_IDENTIFIER,
  name: 'whatsAppMarketingPreferenceUpdatedAt',
  label: 'WhatsApp marketing preference updated at',
  description: 'When WhatsApp last reported that the person stopped or resumed marketing messages',
  type: FieldType.DATE_TIME,
  icon: 'IconCalendarClock',
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  isNullable: true,
});
