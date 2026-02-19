import {
  POST_CARD_ON_POST_CARD_RECIPIENT_ID,
  POST_CARD_RECIPIENTS_ON_POST_CARD_ID,
} from '@/cli/__tests__/apps/rich-app/src/fields/post-card-recipients-on-post-card.field';
import { POST_CARD_RECIPIENT_UNIVERSAL_IDENTIFIER } from '@/cli/__tests__/apps/rich-app/src/objects/post-card-recipient.object';
import { defineField, FieldType, OnDeleteAction, RelationType } from '@/sdk';
import { POST_CARD_UNIVERSAL_IDENTIFIER } from '@/cli/__tests__/apps/rich-app/src/objects/post-card.object';

export default defineField({
  universalIdentifier: POST_CARD_ON_POST_CARD_RECIPIENT_ID,
  objectUniversalIdentifier: POST_CARD_RECIPIENT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'postCard',
  label: 'Post Card',
  relationTargetObjectMetadataUniversalIdentifier:
    POST_CARD_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    POST_CARD_RECIPIENTS_ON_POST_CARD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.CASCADE,
    joinColumnName: 'postCardId',
  },
});
