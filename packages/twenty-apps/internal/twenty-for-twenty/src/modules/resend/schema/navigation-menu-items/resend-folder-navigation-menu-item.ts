import { RESEND_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER } from '@modules/resend/constants/universal-identifiers';
import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

export default defineNavigationMenuItem({
  universalIdentifier: RESEND_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Resend',
  icon: 'IconMail',
  position: 0,
  type: NavigationMenuItemType.FOLDER,
});
