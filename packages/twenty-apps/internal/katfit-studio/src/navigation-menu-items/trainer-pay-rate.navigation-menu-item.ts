import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import { TRAINER_PAY_RATE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/trainer-pay-rate.object';
export default defineNavigationMenuItem({
  universalIdentifier: 'c82bf292-0888-42d6-89b7-774b4118c145',
  position: 11,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: TRAINER_PAY_RATE_OBJECT_UNIVERSAL_IDENTIFIER,
});
