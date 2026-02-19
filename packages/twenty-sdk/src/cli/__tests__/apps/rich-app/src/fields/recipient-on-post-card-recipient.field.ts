import { defineField, FieldType, RelationType, OnDeleteAction } from '@/sdk';
import { RECIPIENT_UNIVERSAL_IDENTIFIER } from '@/cli/__tests__/apps/rich-app/src/objects/recipient.object';
import { POST_CARD_RECIPIENT_UNIVERSAL_IDENTIFIER } from '@/cli/__tests__/apps/rich-app/src/objects/post-card-recipient.object';
import {
  POST_CARD_RECIPIENTS_ON_RECIPIENT_ID,
  RECIPIENT_ON_POST_CARD_RECIPIENT_ID,
} from '@/cli/__tests__/apps/rich-app/src/fields/post-card-recipients-on-recipient.field';

export default defineField({
  universalIdentifier: RECIPIENT_ON_POST_CARD_RECIPIENT_ID,
  objectUniversalIdentifier: POST_CARD_RECIPIENT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'recipient',
  label: 'Recipient',
  relationTargetObjectMetadataUniversalIdentifier:
    RECIPIENT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    POST_CARD_RECIPIENTS_ON_RECIPIENT_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.CASCADE,
    joinColumnName: 'recipientId',
  },
});
