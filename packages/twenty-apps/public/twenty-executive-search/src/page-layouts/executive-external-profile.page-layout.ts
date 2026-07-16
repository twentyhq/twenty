import { definePageLayout } from 'twenty-sdk/define';
import { PageLayoutType } from 'twenty-shared/types';
import { EXECUTIVE_EXTERNAL_PROFILE_UNIVERSAL_IDENTIFIER } from '../objects/executive-external-profile.object';

export default definePageLayout({
  universalIdentifier: '8606f512-f59c-4262-952b-ba6d4205f63f',
  name: 'External Profile Default',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: EXECUTIVE_EXTERNAL_PROFILE_UNIVERSAL_IDENTIFIER,
});
