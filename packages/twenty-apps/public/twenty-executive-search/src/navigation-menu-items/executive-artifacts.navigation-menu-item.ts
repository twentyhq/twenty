import { defineNavigationMenuItem } from 'twenty-sdk/define';
import { NavigationMenuItemType } from 'twenty-sdk/define';
import { EXECUTIVE_ARTIFACT_UNIVERSAL_IDENTIFIER } from '../objects/executive-artifact.object';

export default defineNavigationMenuItem({
  universalIdentifier: '428ea381-baf6-4ce1-b525-d1212b68c41e',
  position: 6,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: EXECUTIVE_ARTIFACT_UNIVERSAL_IDENTIFIER,
});
