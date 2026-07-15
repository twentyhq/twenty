import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import {
  ASSIGNMENT_TEAM_MEMBERS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  ASSIGNMENT_TEAM_MEMBERS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier:
    ASSIGNMENT_TEAM_MEMBERS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Assignment Team Members',
  icon: 'IconUsers',
  color: 'green',
  position: 22,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: ASSIGNMENT_TEAM_MEMBERS_VIEW_UNIVERSAL_IDENTIFIER,
});
