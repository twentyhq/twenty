import {
  RESEND_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  RESEND_TOPIC_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  RESEND_TOPIC_VIEW_UNIVERSAL_IDENTIFIER,
} from '@modules/resend/constants/universal-identifiers';
import { defineNavigationMenuItem } from 'twenty-sdk/define';
import { NavigationMenuItemType } from 'twenty-sdk/define';

export default defineNavigationMenuItem({
  universalIdentifier:
    RESEND_TOPIC_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Topics',
  icon: 'IconHash',
  position: 5,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: RESEND_TOPIC_VIEW_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier:
    RESEND_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
});
