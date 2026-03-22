import { defineField, FieldType } from 'twenty-sdk';
import { POST_CARD_UNIVERSAL_IDENTIFIER } from '../objects/post-card.object';

export default defineField({
  objectUniversalIdentifier: POST_CARD_UNIVERSAL_IDENTIFIER,
  universalIdentifier: '7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d',
  type: FieldType.NUMBER,
  name: 'priority',
  label: 'Priority',
  description: 'Priority level for the post card (1-10)',
});
