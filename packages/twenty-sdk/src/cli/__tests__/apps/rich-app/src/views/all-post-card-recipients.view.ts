import {
  POST_CARD_RECIPIENT_UNIVERSAL_IDENTIFIER,
  SENT_AT_FIELD_UNIVERSAL_IDENTIFIER,
} from '@/cli/__tests__/apps/rich-app/src/objects/post-card-recipient.object';
import { defineView } from '@/sdk';
import { ViewType } from 'twenty-shared/types';

export const ALL_POST_CARD_RECIPIENTS_VIEW_ID =
  'b1a2b3c4-0003-4a7b-8c9d-0e1f2a3b4c5d';

export default defineView({
  universalIdentifier: ALL_POST_CARD_RECIPIENTS_VIEW_ID,
  name: 'All Post Card Recipients',
  objectUniversalIdentifier: POST_CARD_RECIPIENT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconLink',
  position: 2,
  fields: [
    {
      universalIdentifier: 'bf1a2b3c-0004-4a7b-8c9d-0e1f2a3b4c5d',
      fieldMetadataUniversalIdentifier: SENT_AT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 200,
    },
  ],
});
