import { defineCommandMenuItem, numberOfSelectedRecords } from 'twenty-sdk/define';

import {
  WHATSAPP_EDIT_TEMPLATE_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  WHATSAPP_EDIT_TEMPLATE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  WHATSAPP_TEMPLATE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineCommandMenuItem({
  universalIdentifier: WHATSAPP_EDIT_TEMPLATE_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  label: 'Edit in WhatsApp',
  shortLabel: 'Edit',
  isPinned: false,
  availabilityType: 'RECORD_SELECTION',
  availabilityObjectUniversalIdentifier: WHATSAPP_TEMPLATE_UNIVERSAL_IDENTIFIER,
  conditionalAvailabilityExpression: numberOfSelectedRecords === 1,
  frontComponentUniversalIdentifier: WHATSAPP_EDIT_TEMPLATE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
