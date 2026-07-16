import { definePageLayout } from 'twenty-sdk/define';
import { PageLayoutType } from 'twenty-sdk/define';
import { EXTERNAL_ENTITY_LINK_UNIVERSAL_IDENTIFIER } from '../objects/external-entity-link.object';

export default definePageLayout({
  universalIdentifier: '5aa791a1-6dd8-4575-9bd5-c49a4bf942a9',
  name: 'External Entity Link Default',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: EXTERNAL_ENTITY_LINK_UNIVERSAL_IDENTIFIER,
});
