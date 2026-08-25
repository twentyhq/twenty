import {
  NavigationMenuItemType,
  defineNavigationMenuItem,
} from 'twenty-sdk/define';

import {
  APPLICATION_INBOX_NAV_UNIVERSAL_IDENTIFIER,
  APPLICATION_INBOX_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: APPLICATION_INBOX_NAV_UNIVERSAL_IDENTIFIER,
  type: NavigationMenuItemType.VIEW,
  icon: 'IconGavel',
  position: 5,
  folderUniversalIdentifier: '857be3b5-82c6-45f7-b546-e20a8a97be8d',
  viewUniversalIdentifier: APPLICATION_INBOX_VIEW_UNIVERSAL_IDENTIFIER,
});
