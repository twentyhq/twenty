import { defineView } from 'twenty-sdk/define';
import { ViewType } from 'twenty-sdk/define';
import { EXECUTIVE_SEARCH_PREFERENCE_UNIVERSAL_IDENTIFIER } from '../objects/executive-search-preference.object';

export const EXECUTIVE_SEARCH_PREFERENCE_VIEW_ID =
  '9da7d8f4-3e13-4c36-8684-9e25f66fa6bb';

export default defineView({
  universalIdentifier: EXECUTIVE_SEARCH_PREFERENCE_VIEW_ID,
  name: 'All Search Preferences',
  objectUniversalIdentifier: EXECUTIVE_SEARCH_PREFERENCE_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconSettings',
  position: 0,
  fields: [],
});
