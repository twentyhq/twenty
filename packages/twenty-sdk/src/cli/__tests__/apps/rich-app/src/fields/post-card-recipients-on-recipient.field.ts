import { defineField, FieldType, RelationType } from '@/sdk';
import { RECIPIENT_UNIVERSAL_IDENTIFIER } from '@/cli/__tests__/apps/rich-app/src/objects/recipient.object';
import { POST_CARD_RECIPIENT_UNIVERSAL_IDENTIFIER } from '@/cli/__tests__/apps/rich-app/src/objects/post-card-recipient.object';

export const POST_CARD_RECIPIENTS_ON_RECIPIENT_ID =
  'a1a2b3c4-0003-4a7b-8c9d-0e1f2a3b4c5d';
export const RECIPIENT_ON_POST_CARD_RECIPIENT_ID =
  'a1a2b3c4-0004-4a7b-8c9d-0e1f2a3b4c5d';

export default defineField({
  universalIdentifier: POST_CARD_RECIPIENTS_ON_RECIPIENT_ID,
  objectUniversalIdentifier: RECIPIENT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'postCardRecipients',
  label: 'Post Card Recipients',
  relationTargetObjectMetadataUniversalIdentifier:
    POST_CARD_RECIPIENT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    RECIPIENT_ON_POST_CARD_RECIPIENT_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
