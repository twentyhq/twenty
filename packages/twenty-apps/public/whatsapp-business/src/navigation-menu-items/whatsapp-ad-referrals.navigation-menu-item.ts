import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import {
  WHATSAPP_AD_REFERRALS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  WHATSAPP_AD_REFERRALS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: WHATSAPP_AD_REFERRALS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'WhatsApp ad referrals',
  icon: 'IconAd',
  color: 'green',
  position: 2,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: WHATSAPP_AD_REFERRALS_VIEW_UNIVERSAL_IDENTIFIER,
});
