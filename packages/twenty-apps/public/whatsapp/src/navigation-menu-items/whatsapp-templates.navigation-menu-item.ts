import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import {
  WHATSAPP_TEMPLATES_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  WHATSAPP_TEMPLATES_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: WHATSAPP_TEMPLATES_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'WhatsApp templates',
  icon: 'IconTemplate',
  color: 'green',
  position: 0,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: WHATSAPP_TEMPLATES_VIEW_UNIVERSAL_IDENTIFIER,
});
