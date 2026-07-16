import { definePageLayout } from 'twenty-sdk/define';
import { PageLayoutType } from 'twenty-shared/types';
import { EXECUTIVE_EDUCATION_UNIVERSAL_IDENTIFIER } from '../objects/executive-education.object';

export default definePageLayout({
  universalIdentifier: '5496fa15-33d4-4ea9-a9dd-aeac219f38ef',
  name: 'Education Default',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: EXECUTIVE_EDUCATION_UNIVERSAL_IDENTIFIER,
});
