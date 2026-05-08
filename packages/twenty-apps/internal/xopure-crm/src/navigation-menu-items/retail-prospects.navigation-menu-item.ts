import { defineNavigationMenuItem } from 'twenty-sdk/define';
import { NavigationMenuItemType } from 'twenty-sdk/define';
import { RETAIL_PROSPECT_OBJECT_ID } from '../objects/retail-prospect.object';

export default defineNavigationMenuItem({ universalIdentifier: '769e32f6-2456-4921-a311-14f8309e3c64', position: 20, type: NavigationMenuItemType.OBJECT, targetObjectUniversalIdentifier: RETAIL_PROSPECT_OBJECT_ID });
