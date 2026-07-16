import { defineNavigationMenuItem } from 'twenty-sdk/define';
import { NavigationMenuItemType } from 'twenty-sdk/define';
import { EXECUTIVE_SEARCH_PREFERENCE_UNIVERSAL_IDENTIFIER } from '../objects/executive-search-preference.object';

export default defineNavigationMenuItem({
  universalIdentifier: '43bab942-9037-49ce-acbf-f118be38679b',
  position: 9,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier:
    EXECUTIVE_SEARCH_PREFERENCE_UNIVERSAL_IDENTIFIER,
});
