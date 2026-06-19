import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import { XOPURE_PAYOUT_BATCH_OBJECT_ID } from '../objects/xopure-payout-batch.object';

export default defineNavigationMenuItem({
  universalIdentifier: '37ee4133-c316-4ec0-86b9-abffaf3c83f4',
  position: 43,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: XOPURE_PAYOUT_BATCH_OBJECT_ID,
});
