import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import { XOPURE_REFERRAL_RELATIONSHIP_OBJECT_ID } from '../objects/xopure-referral-relationship.object';

export default defineNavigationMenuItem({
  universalIdentifier: '34431baf-bcb7-42a6-9dc3-93d224d90615',
  position: 12,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: XOPURE_REFERRAL_RELATIONSHIP_OBJECT_ID,
});
