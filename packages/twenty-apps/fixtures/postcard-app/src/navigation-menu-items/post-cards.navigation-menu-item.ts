import { defineNavigationMenuItem } from 'twenty-sdk';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { POST_CARD_UNIVERSAL_IDENTIFIER } from '../objects/post-card.object';

export default defineNavigationMenuItem({
  universalIdentifier: 'c1a2b3c4-0001-4a7b-8c9d-0e1f2a3b4c5d',
  position: 0,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: POST_CARD_UNIVERSAL_IDENTIFIER,
});
