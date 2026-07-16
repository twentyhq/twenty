import { defineNavigationMenuItem } from 'twenty-sdk/define';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { EXECUTIVE_LANGUAGE_UNIVERSAL_IDENTIFIER } from '../objects/executive-language.object';

export default defineNavigationMenuItem({
  universalIdentifier: '4da69f11-61d1-458f-b63e-2eec737d42e3',
  position: 5,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: EXECUTIVE_LANGUAGE_UNIVERSAL_IDENTIFIER,
});
