import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import { PARTNERS_PER_COUNTRY_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/partners-per-country.view';

export default defineNavigationMenuItem({
  universalIdentifier: '284df145-0d35-4733-92ea-89aff788d6a9',
  type: NavigationMenuItemType.VIEW,
  icon: 'IconMap',
  position: 2,
  folderUniversalIdentifier: '857be3b5-82c6-45f7-b546-e20a8a97be8d',
  viewUniversalIdentifier: PARTNERS_PER_COUNTRY_VIEW_UNIVERSAL_IDENTIFIER,
});
