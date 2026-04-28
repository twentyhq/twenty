import {
  RESEND_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  RESEND_TEMPLATE_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  RESEND_TEMPLATE_VIEW_UNIVERSAL_IDENTIFIER,
} from '@modules/resend/constants/universal-identifiers';
import { defineNavigationMenuItem } from 'twenty-sdk/define';
import { NavigationMenuItemType } from 'twenty-sdk/define';

export default defineNavigationMenuItem({
  universalIdentifier:
    RESEND_TEMPLATE_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Templates',
  icon: 'IconTemplate',
  position: 3,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: RESEND_TEMPLATE_VIEW_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier:
    RESEND_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
});
