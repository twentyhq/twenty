import { defineCommandMenuItem, isSelectAll } from 'twenty-sdk/define';

import {
  WHATSAPP_DELETE_TEMPLATE_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  WHATSAPP_DELETE_TEMPLATE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  WHATSAPP_TEMPLATE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineCommandMenuItem({
  universalIdentifier: WHATSAPP_DELETE_TEMPLATE_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  label: 'Delete in WhatsApp',
  shortLabel: 'Delete',
  isPinned: false,
  availabilityType: 'RECORD_SELECTION',
  availabilityObjectUniversalIdentifier: WHATSAPP_TEMPLATE_UNIVERSAL_IDENTIFIER,
  conditionalAvailabilityExpression: !isSelectAll,
  frontComponentUniversalIdentifier: WHATSAPP_DELETE_TEMPLATE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
