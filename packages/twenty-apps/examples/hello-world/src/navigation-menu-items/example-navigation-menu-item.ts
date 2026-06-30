import { defineNavigationMenuItem } from 'twenty-sdk/define';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { EXAMPLE_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/example-view';

export default defineNavigationMenuItem({
  universalIdentifier: '9327db91-afa1-41b6-bd9d-2b51a26efb4c',
  name: 'example-navigation-menu-item',
  icon: 'IconList',
  color: 'blue',
  position: 0,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: EXAMPLE_VIEW_UNIVERSAL_IDENTIFIER,
});
