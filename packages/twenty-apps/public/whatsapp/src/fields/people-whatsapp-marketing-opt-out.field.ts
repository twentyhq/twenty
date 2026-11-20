import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { WHATSAPP_MARKETING_OPT_OUT_PEOPLE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: WHATSAPP_MARKETING_OPT_OUT_PEOPLE_FIELD_UNIVERSAL_IDENTIFIER,
  name: 'whatsAppMarketingOptOut',
  label: 'WhatsApp marketing opt-out',
  description: 'The person asked WhatsApp to stop marketing messages from this business; marketing templates are not sent to them',
  type: FieldType.BOOLEAN,
  icon: 'IconMessageOff',
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  defaultValue: false,
});
