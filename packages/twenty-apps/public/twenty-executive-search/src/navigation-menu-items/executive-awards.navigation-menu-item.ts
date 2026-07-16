import { defineNavigationMenuItem } from 'twenty-sdk/define';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { EXECUTIVE_AWARD_UNIVERSAL_IDENTIFIER } from '../objects/executive-award.object';

export default defineNavigationMenuItem({
  universalIdentifier: '2184a9ac-06e2-4f67-a4c4-52ae5b3d4b40',
  position: 7,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: EXECUTIVE_AWARD_UNIVERSAL_IDENTIFIER,
});
