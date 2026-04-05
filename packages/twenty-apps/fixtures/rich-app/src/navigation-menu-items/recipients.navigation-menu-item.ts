import { defineNavigationMenuItem } from 'twenty-sdk';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { RECIPIENT_UNIVERSAL_IDENTIFIER } from '../objects/recipient.object';

export default defineNavigationMenuItem({
  universalIdentifier: 'c1a2b3c4-0002-4a7b-8c9d-0e1f2a3b4c5d',
  position: 1,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: RECIPIENT_UNIVERSAL_IDENTIFIER,
});
