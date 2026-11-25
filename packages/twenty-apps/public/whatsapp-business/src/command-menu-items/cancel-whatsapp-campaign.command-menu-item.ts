import { defineCommandMenuItem, numberOfSelectedRecords } from 'twenty-sdk/define';

import {
  WHATSAPP_CAMPAIGN_UNIVERSAL_IDENTIFIER,
  WHATSAPP_CANCEL_CAMPAIGN_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  WHATSAPP_CANCEL_CAMPAIGN_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineCommandMenuItem({
  universalIdentifier: WHATSAPP_CANCEL_CAMPAIGN_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  label: 'Cancel WhatsApp campaign',
  shortLabel: 'Cancel',
  isPinned: false,
  availabilityType: 'RECORD_SELECTION',
  availabilityObjectUniversalIdentifier: WHATSAPP_CAMPAIGN_UNIVERSAL_IDENTIFIER,
  conditionalAvailabilityExpression: numberOfSelectedRecords === 1,
  frontComponentUniversalIdentifier: WHATSAPP_CANCEL_CAMPAIGN_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
