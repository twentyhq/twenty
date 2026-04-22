import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

export const CONTRIBUTORS_FOLDER_UNIVERSAL_IDENTIFIER =
  '6507ee24-2fc2-44c3-935d-3456b3986910';

export default defineNavigationMenuItem({
  universalIdentifier: CONTRIBUTORS_FOLDER_UNIVERSAL_IDENTIFIER,
  name: 'Contributors',
  icon: 'IconUsers',
  color: 'sky',
  position: 0,
  type: NavigationMenuItemType.FOLDER,
});
