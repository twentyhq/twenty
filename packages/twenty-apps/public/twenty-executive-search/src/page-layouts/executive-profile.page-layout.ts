import { definePageLayout } from 'twenty-sdk/define';
import { PageLayoutType } from 'twenty-shared/types';
import { EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER } from '../objects/executive-profile.object';

export const EXECUTIVE_PROFILE_PAGE_LAYOUT_ID =
  'b11e256a-334e-4a2f-a06f-10a30a8b9219';

export default definePageLayout({
  universalIdentifier: EXECUTIVE_PROFILE_PAGE_LAYOUT_ID,
  name: 'Executive Profile Default',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER,
});
