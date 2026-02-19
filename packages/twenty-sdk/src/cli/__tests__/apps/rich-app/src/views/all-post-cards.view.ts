import { defineView } from '@/sdk';
import {
  CONTENT_FIELD_UNIVERSAL_IDENTIFIER,
  POST_CARD_UNIVERSAL_IDENTIFIER,
} from '@/cli/__tests__/apps/rich-app/src/objects/post-card.object';
import { ViewType } from 'twenty-shared/types';

export const ALL_POST_CARDS_VIEW_ID = 'b1a2b3c4-0001-4a7b-8c9d-0e1f2a3b4c5d';

export default defineView({
  universalIdentifier: ALL_POST_CARDS_VIEW_ID,
  name: 'All Post Cards',
  objectUniversalIdentifier: POST_CARD_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconMail',
  position: 0,
  fields: [
    {
      universalIdentifier: 'bf1a2b3c-0001-4a7b-8c9d-0e1f2a3b4c5d',
      fieldMetadataUniversalIdentifier: CONTENT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: 'bf1a2b3c-0002-4a7b-8c9d-0e1f2a3b4c5d',
      fieldMetadataUniversalIdentifier: '87b675b8-dd8c-4448-b4ca-20e5a2234a1e',
      position: 1,
      isVisible: true,
      size: 150,
    },
  ],
});
