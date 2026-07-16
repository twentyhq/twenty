import { defineNavigationMenuItem } from 'twenty-sdk/define';
import { NavigationMenuItemType } from 'twenty-sdk/define';
import { EXECUTIVE_EXTERNAL_PROFILE_UNIVERSAL_IDENTIFIER } from '../objects/executive-external-profile.object';

export default defineNavigationMenuItem({
  universalIdentifier: '67658b61-343d-4f35-a2b8-a5fb0014fea3',
  position: 8,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier:
    EXECUTIVE_EXTERNAL_PROFILE_UNIVERSAL_IDENTIFIER,
});
