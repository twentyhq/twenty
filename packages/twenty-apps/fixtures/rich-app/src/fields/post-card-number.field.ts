import { defineField, FieldType } from 'twenty-sdk/define';
import { POST_CARD_UNIVERSAL_IDENTIFIER } from '../objects/post-card.object';

export default defineField({
  objectUniversalIdentifier: POST_CARD_UNIVERSAL_IDENTIFIER,
  universalIdentifier: '7b57bd63-5a4c-46ca-9d52-42c8f02d1df6',
  type: FieldType.NUMBER,
  name: 'priority',
  label: 'Priority',
  description: 'Priority level for the post card (1-10)',
});
