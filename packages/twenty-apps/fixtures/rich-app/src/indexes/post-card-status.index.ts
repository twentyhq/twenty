import { defineIndex } from 'twenty-sdk/define';

import {
  POST_CARD_UNIVERSAL_IDENTIFIER,
  STATUS_FIELD_UNIVERSAL_IDENTIFIER,
} from '../objects/post-card.object';

export default defineIndex({
  universalIdentifier: 'b6e9d2a1-5a4c-46ca-9d52-42c8f02d1ff0',
  objectUniversalIdentifier: POST_CARD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: 'b6e9d2a1-5a4c-46ca-9d52-42c8f02d1ff1',
      fieldUniversalIdentifier: STATUS_FIELD_UNIVERSAL_IDENTIFIER,
    },
  ],
});
