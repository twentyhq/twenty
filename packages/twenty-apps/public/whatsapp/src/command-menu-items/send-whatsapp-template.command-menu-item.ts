import { defineCommandMenuItem, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import {
  WHATSAPP_SEND_TEMPLATE_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  WHATSAPP_SEND_TEMPLATE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineCommandMenuItem({
  universalIdentifier: WHATSAPP_SEND_TEMPLATE_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  label: 'Send WhatsApp template',
  shortLabel: 'WhatsApp template',
  icon: 'IconBrandWhatsapp',
  isPinned: false,
  availabilityType: 'RECORD_SELECTION',
  availabilityObjectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  frontComponentUniversalIdentifier: WHATSAPP_SEND_TEMPLATE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
