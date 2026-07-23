import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

export const PARTNER_WORKSPACE_FOLDER_UNIVERSAL_IDENTIFIER =
  '8e416e6f-8c5d-47d6-ad39-d1f882904c73';

export default defineNavigationMenuItem({
  universalIdentifier: PARTNER_WORKSPACE_FOLDER_UNIVERSAL_IDENTIFIER,
  type: NavigationMenuItemType.FOLDER,
  name: 'Partner Workspace',
  icon: 'IconUser',
  position: -3,
});
