import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import { SHOWING_UNIVERSAL_IDENTIFIER } from '../objects/showing.object';

export default defineNavigationMenuItem({
  universalIdentifier: '075cab08-9a87-401a-b3b2-47f8e0504113',
  position: 1,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: SHOWING_UNIVERSAL_IDENTIFIER,
});
