import { defineNavigationMenuItem } from 'twenty-sdk/define';
import { NavigationMenuItemType } from 'twenty-sdk/define';
import { XOPURE_ORDER_OBJECT_ID } from '../objects/xopure-order.object';

export default defineNavigationMenuItem({ universalIdentifier: '28bd7585-6641-49b5-90a9-7a2e04319a2c', position: 12, type: NavigationMenuItemType.OBJECT, targetObjectUniversalIdentifier: XOPURE_ORDER_OBJECT_ID });
