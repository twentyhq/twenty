import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import { STUDIO_TRAINER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/studio-trainer.object';
export default defineNavigationMenuItem({
  universalIdentifier: '5700e218-363a-4e8a-be67-c1c7d5e2fec1',
  position: 10,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: STUDIO_TRAINER_OBJECT_UNIVERSAL_IDENTIFIER,
});
