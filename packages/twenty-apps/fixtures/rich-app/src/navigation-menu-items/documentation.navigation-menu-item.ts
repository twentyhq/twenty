import { defineNavigationMenuItem } from 'twenty-sdk/define';
import { NavigationMenuItemType } from 'twenty-shared/types';

export default defineNavigationMenuItem({
  universalIdentifier: 'c1a2b3c4-0004-4a7b-8c9d-0e1f2a3b4c5d',
  name: 'Documentation',
  icon: 'IconBook',
  position: 0,
  type: NavigationMenuItemType.LINK,
  link: 'https://twenty.com/developers',
});
