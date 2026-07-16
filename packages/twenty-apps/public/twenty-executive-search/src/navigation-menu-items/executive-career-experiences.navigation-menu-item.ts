import { defineNavigationMenuItem } from 'twenty-sdk/define';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { EXECUTIVE_CAREER_EXPERIENCE_UNIVERSAL_IDENTIFIER } from '../objects/executive-career-experience.object';

export default defineNavigationMenuItem({
  universalIdentifier: 'e2600482-ad7d-4192-b215-4f65bcd2d7c6',
  position: 1,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier:
    EXECUTIVE_CAREER_EXPERIENCE_UNIVERSAL_IDENTIFIER,
});
