import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import { PROPERTY_UNIVERSAL_IDENTIFIER } from '../objects/property.object';

export default defineNavigationMenuItem({
  universalIdentifier: 'f034a868-8acc-4aa9-8c1d-86eba3d89fbe',
  position: 0,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: PROPERTY_UNIVERSAL_IDENTIFIER,
});
