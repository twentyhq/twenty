import {
  RESEND_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  RESEND_SEGMENT_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  RESEND_SEGMENT_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/modules/resend/constants/universal-identifiers';
import { defineNavigationMenuItem } from 'twenty-sdk/define';
import { NavigationMenuItemType } from 'twenty-shared/types';

export default defineNavigationMenuItem({
  universalIdentifier:
    RESEND_SEGMENT_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Segments',
  icon: 'IconUsersGroup',
  position: 4,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: RESEND_SEGMENT_VIEW_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier:
    RESEND_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
});
