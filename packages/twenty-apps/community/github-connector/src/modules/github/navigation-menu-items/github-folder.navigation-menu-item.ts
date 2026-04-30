import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

export const GITHUB_FOLDER_UNIVERSAL_IDENTIFIER =
  'a4f7d8b1-2c93-4e6f-8b1a-9d3e5c7f2a48';

export default defineNavigationMenuItem({
  universalIdentifier: GITHUB_FOLDER_UNIVERSAL_IDENTIFIER,
  name: 'GitHub',
  icon: 'IconBrandGithub',
  color: 'gray',
  position: 0,
  type: NavigationMenuItemType.FOLDER,
});
