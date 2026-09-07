import {
  NavigationMenuItemType,
  defineNavigationMenuItem,
} from 'twenty-sdk/define';

import {
  HOW_TO_APPLY_NAV_ITEM_ID,
  HOW_TO_APPLY_PAGE_LAYOUT_ID,
} from 'src/modules/opportunity/how-to-process/constants/how-to-process.constants';
import { PARTNER_WORKSPACE_FOLDER_UNIVERSAL_IDENTIFIER } from 'src/modules/shared/navigation-menu-items/partner-workspace-folder.navigation-menu-item';

export default defineNavigationMenuItem({
  universalIdentifier: HOW_TO_APPLY_NAV_ITEM_ID,
  name: 'How to apply',
  type: NavigationMenuItemType.PAGE_LAYOUT,
  icon: 'IconListCheck',
  position: 0,
  folderUniversalIdentifier: PARTNER_WORKSPACE_FOLDER_UNIVERSAL_IDENTIFIER,
  pageLayoutUniversalIdentifier: HOW_TO_APPLY_PAGE_LAYOUT_ID,
});
