import { definePageLayout } from 'twenty-sdk/define';
import { PageLayoutType } from 'twenty-shared/types';
import { EXECUTIVE_ARTIFACT_UNIVERSAL_IDENTIFIER } from '../objects/executive-artifact.object';

export default definePageLayout({
  universalIdentifier: '150c01cd-c296-4b6b-a241-d7d5faf34191',
  name: 'Artifact Default',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: EXECUTIVE_ARTIFACT_UNIVERSAL_IDENTIFIER,
});
