import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import { TRIGGER_UNIVERSAL_IDENTIFIER } from 'src/objects/trigger.object';

export default defineNavigationMenuItem({
  universalIdentifier: '7101692c-3859-40af-b925-a7a115a6b770',
  position: 0,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: TRIGGER_UNIVERSAL_IDENTIFIER,
});
