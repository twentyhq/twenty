import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

export const MATCHING_FOLDER_UNIVERSAL_IDENTIFIER = 'c0a8b110-0000-4000-8000-000000000001';

export default defineNavigationMenuItem({
  universalIdentifier: MATCHING_FOLDER_UNIVERSAL_IDENTIFIER,
  type: NavigationMenuItemType.FOLDER,
  name: 'Matching',
  icon: 'IconArrowsJoin',
  color: 'blue',
  position: -3,
});
