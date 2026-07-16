import { defineNavigationMenuItem } from 'twenty-sdk/define';
import { NavigationMenuItemType } from 'twenty-sdk/define';
import { EXECUTIVE_EDUCATION_UNIVERSAL_IDENTIFIER } from '../objects/executive-education.object';

export default defineNavigationMenuItem({
  universalIdentifier: 'b1960f20-df0d-4f2f-923f-63f371fb18e3',
  position: 2,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: EXECUTIVE_EDUCATION_UNIVERSAL_IDENTIFIER,
});
