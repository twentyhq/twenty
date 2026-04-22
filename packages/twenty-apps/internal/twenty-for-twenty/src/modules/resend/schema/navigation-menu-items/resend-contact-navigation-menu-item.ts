import {
  RESEND_CONTACT_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  RESEND_CONTACT_VIEW_UNIVERSAL_IDENTIFIER,
  RESEND_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/modules/resend/constants/universal-identifiers';
import { defineNavigationMenuItem } from 'twenty-sdk/define';
import { NavigationMenuItemType } from 'twenty-shared/types';

export default defineNavigationMenuItem({
  universalIdentifier: RESEND_CONTACT_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Contacts',
  icon: 'IconAddressBook',
  position: 1,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: RESEND_CONTACT_VIEW_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier:
    RESEND_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
});
