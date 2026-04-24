import { defineView } from 'twenty-sdk/define';
import { ViewType } from 'twenty-shared/types';
import {
  POST_CARD_RECIPIENT_UNIVERSAL_IDENTIFIER,
  SENT_AT_FIELD_UNIVERSAL_IDENTIFIER,
} from '../objects/post-card-recipient.object';

export const ALL_POST_CARD_RECIPIENTS_VIEW_ID =
  'b1a2b3c4-0003-4a7b-8c9d-0e1f2a3b4c5d';

export const POST_CARD_RECIPIENT_SENT_AT_FIELD_UNIVERSAL_IDENTIFIER =
  'fd959c6f-3465-4a3a-b7ad-3f4004fffc9a';

export default defineView({
  universalIdentifier: ALL_POST_CARD_RECIPIENTS_VIEW_ID,
  name: 'All Post Card Recipients',
  objectUniversalIdentifier: POST_CARD_RECIPIENT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconLink',
  position: 2,
  fields: [
    {
      universalIdentifier:
        POST_CARD_RECIPIENT_SENT_AT_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier: SENT_AT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 200,
    },
  ],
});
