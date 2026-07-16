import { definePageLayout } from 'twenty-sdk/define';
import { PageLayoutType } from 'twenty-shared/types';
import { EXECUTIVE_SEARCH_PREFERENCE_UNIVERSAL_IDENTIFIER } from '../objects/executive-search-preference.object';

export default definePageLayout({
  universalIdentifier: '0e808563-0583-47ab-930c-b3b7795b7a95',
  name: 'Search Preference Default',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: EXECUTIVE_SEARCH_PREFERENCE_UNIVERSAL_IDENTIFIER,
});
