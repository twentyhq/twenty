import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import { TRAINER_RATE_ASSIGNMENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/trainer-rate-assignment.object';
export default defineNavigationMenuItem({
  universalIdentifier: '99dd3dab-8a2d-4247-b181-d235faeab8ec',
  position: 12,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier:
    TRAINER_RATE_ASSIGNMENT_OBJECT_UNIVERSAL_IDENTIFIER,
});
