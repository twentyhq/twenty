import { defineNavigationMenuItem } from 'twenty-sdk/define';
import { NavigationMenuItemType } from 'twenty-sdk/define';
import { XOPURE_CUSTOMER_OBJECT_ID } from '../objects/xopure-customer.object';

export default defineNavigationMenuItem({ universalIdentifier: 'b8f45379-ff9a-4684-aa33-8fb587df8465', position: 10, type: NavigationMenuItemType.OBJECT, targetObjectUniversalIdentifier: XOPURE_CUSTOMER_OBJECT_ID });
