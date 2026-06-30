import { defineNavigationMenuItem } from 'twenty-sdk/define';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { POST_CARD_UNIVERSAL_IDENTIFIER } from '../objects/post-card.object';

export default defineNavigationMenuItem({
  universalIdentifier: 'e8031eca-d6ea-4a4b-b828-38227dba896a',
  position: 0,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: POST_CARD_UNIVERSAL_IDENTIFIER,
});
