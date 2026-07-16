import { definePageLayout } from 'twenty-sdk/define';
import { PageLayoutType } from 'twenty-sdk/define';
import { EXECUTIVE_CAREER_EXPERIENCE_UNIVERSAL_IDENTIFIER } from '../objects/executive-career-experience.object';

export default definePageLayout({
  universalIdentifier: '4f480af7-7c9c-4f6a-8f81-8fd209ab98fa',
  name: 'Career Experience Default',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: EXECUTIVE_CAREER_EXPERIENCE_UNIVERSAL_IDENTIFIER,
});
