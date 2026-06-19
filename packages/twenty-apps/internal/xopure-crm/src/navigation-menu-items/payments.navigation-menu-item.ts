import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import { XOPURE_PAYMENT_OBJECT_ID } from '../objects/xopure-payment.object';

export default defineNavigationMenuItem({
  universalIdentifier: 'a3af9441-52bb-4a9b-a000-11aefb0c4b84',
  position: 42,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: XOPURE_PAYMENT_OBJECT_ID,
});
