import { defineNavigationMenuItem } from 'twenty-sdk/define';
import { NavigationMenuItemType } from 'twenty-sdk/define';
import { EXECUTIVE_CAPABILITY_UNIVERSAL_IDENTIFIER } from '../objects/executive-capability.object';

export default defineNavigationMenuItem({
  universalIdentifier: 'f30e8a59-6189-4f69-b21b-60ffc6f187e6',
  position: 4,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: EXECUTIVE_CAPABILITY_UNIVERSAL_IDENTIFIER,
});
