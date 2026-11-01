import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import { TRAINER_PAY_ENTRY_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/trainer-pay-entry.object';
export default defineNavigationMenuItem({
  universalIdentifier: '3452a533-4feb-4976-8fdb-bc3044c1195b',
  position: 13,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier:
    TRAINER_PAY_ENTRY_OBJECT_UNIVERSAL_IDENTIFIER,
});
