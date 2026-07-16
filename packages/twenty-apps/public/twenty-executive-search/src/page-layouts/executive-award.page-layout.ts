import { definePageLayout } from 'twenty-sdk/define';
import { PageLayoutType } from 'twenty-shared/types';
import { EXECUTIVE_AWARD_UNIVERSAL_IDENTIFIER } from '../objects/executive-award.object';

export default definePageLayout({
  universalIdentifier: '847ff51c-b864-4460-a614-24b45335a379',
  name: 'Award Default',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: EXECUTIVE_AWARD_UNIVERSAL_IDENTIFIER,
});
