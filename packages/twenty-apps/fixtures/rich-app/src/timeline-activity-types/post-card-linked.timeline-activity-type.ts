import { defineTimelineActivityType } from 'twenty-sdk/define';

import { POST_CARD_RECIPIENTS_ON_POST_CARD_ID } from '../fields/post-card-recipients-on-post-card.field';
import { POST_CARD_UNIVERSAL_IDENTIFIER } from '../objects/post-card.object';

export default defineTimelineActivityType({
  universalIdentifier: 'f4fa646c-6e11-4d8f-a6be-c3b7a2fc7501',
  name: 'postCardLinked',
  label: 'received a post card',
  icon: 'IconMail',
  emit: {
    on: 'linked',
    objectUniversalIdentifier: POST_CARD_UNIVERSAL_IDENTIFIER,
    through: {
      relationFieldUniversalIdentifier: POST_CARD_RECIPIENTS_ON_POST_CARD_ID,
    },
  },
  frontComponentUniversalIdentifier: '88c15ae2-5f87-4a6b-b48f-1974bbe62eb7',
});
