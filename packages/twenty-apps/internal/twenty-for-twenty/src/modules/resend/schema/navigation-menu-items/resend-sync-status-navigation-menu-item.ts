import {
  RESEND_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  RESEND_SYNC_STATUS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  RESEND_SYNC_STATUS_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
} from '@modules/resend/constants/universal-identifiers';
import { RESEND_SYNC_STATUS_NAVIGATION_MENU_ITEM_NAME } from '@modules/resend/manual-sync/constants/resend-sync-status-menu-item-name';
import { defineNavigationMenuItem } from 'twenty-sdk/define';
import { NavigationMenuItemType } from 'twenty-sdk/define';

export default defineNavigationMenuItem({
  universalIdentifier:
    RESEND_SYNC_STATUS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: RESEND_SYNC_STATUS_NAVIGATION_MENU_ITEM_NAME,
  icon: 'IconRefresh',
  position: 100,
  type: NavigationMenuItemType.PAGE_LAYOUT,
  pageLayoutUniversalIdentifier:
    RESEND_SYNC_STATUS_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier:
    RESEND_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
});
