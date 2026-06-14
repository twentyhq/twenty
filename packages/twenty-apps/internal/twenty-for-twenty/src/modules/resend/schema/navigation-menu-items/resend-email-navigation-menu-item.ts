import {
  RESEND_EMAIL_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  RESEND_EMAIL_VIEW_UNIVERSAL_IDENTIFIER,
  RESEND_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
} from '@modules/resend/constants/universal-identifiers';
import { defineNavigationMenuItem } from 'twenty-sdk/define';
import { NavigationMenuItemType } from 'twenty-sdk/define';

export default defineNavigationMenuItem({
  universalIdentifier: RESEND_EMAIL_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Emails',
  icon: 'IconMail',
  position: 0,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: RESEND_EMAIL_VIEW_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier:
    RESEND_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
});
