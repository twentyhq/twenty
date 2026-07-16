import { defineNavigationMenuItem } from 'twenty-sdk/define';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { EXECUTIVE_BOARD_SERVICE_UNIVERSAL_IDENTIFIER } from '../objects/executive-board-service.object';

export default defineNavigationMenuItem({
  universalIdentifier: 'ef9ff0ea-de98-485d-b47f-c1add19d0f1e',
  position: 3,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: EXECUTIVE_BOARD_SERVICE_UNIVERSAL_IDENTIFIER,
});
