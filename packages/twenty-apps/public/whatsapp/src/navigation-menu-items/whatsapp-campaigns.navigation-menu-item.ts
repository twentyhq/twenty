import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import {
  WHATSAPP_CAMPAIGNS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  WHATSAPP_CAMPAIGNS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: WHATSAPP_CAMPAIGNS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'WhatsApp campaigns',
  icon: 'IconSpeakerphone',
  color: 'green',
  position: 1,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: WHATSAPP_CAMPAIGNS_VIEW_UNIVERSAL_IDENTIFIER,
});
