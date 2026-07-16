import { definePageLayout } from 'twenty-sdk/define';
import { PageLayoutType } from 'twenty-sdk/define';
import { EXECUTIVE_CAPABILITY_UNIVERSAL_IDENTIFIER } from '../objects/executive-capability.object';

export default definePageLayout({
  universalIdentifier: '26ca5ca4-1a3d-44fd-b7c1-9550ee95e765',
  name: 'Capability Default',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: EXECUTIVE_CAPABILITY_UNIVERSAL_IDENTIFIER,
});
