import { POST_CARD_RECIPIENT_UNIVERSAL_IDENTIFIER } from '@/cli/__tests__/apps/rich-app/src/objects/post-card-recipient.object';
import { defineField, FieldType, RelationType } from '@/sdk';
import { POST_CARD_UNIVERSAL_IDENTIFIER } from '@/cli/__tests__/apps/rich-app/src/objects/post-card.object';

export const POST_CARD_RECIPIENTS_ON_POST_CARD_ID =
  'a1a2b3c4-0001-4a7b-8c9d-0e1f2a3b4c5d';
export const POST_CARD_ON_POST_CARD_RECIPIENT_ID =
  'a1a2b3c4-0002-4a7b-8c9d-0e1f2a3b4c5d';

export default defineField({
  universalIdentifier: POST_CARD_RECIPIENTS_ON_POST_CARD_ID,
  objectUniversalIdentifier: POST_CARD_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'postCardRecipients',
  label: 'Post Card Recipients',
  relationTargetObjectMetadataUniversalIdentifier:
    POST_CARD_RECIPIENT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    POST_CARD_ON_POST_CARD_RECIPIENT_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
