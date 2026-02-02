import { defineField, FieldType } from '@/sdk';
import { POST_CARD_UNIVERSAL_IDENTIFIER } from '@/cli/__tests__/apps/rich-app/src/objects/postCard.object';

export const POST_CARD_EXTENSION_PRIORITY_FIELD_ID =
  '7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d';

export const POST_CARD_EXTENSION_CATEGORY_FIELD_ID =
  '8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e';

export default defineField({
  objectUniversalIdentifier: POST_CARD_UNIVERSAL_IDENTIFIER,
  universalIdentifier: POST_CARD_EXTENSION_PRIORITY_FIELD_ID,
  type: FieldType.NUMBER,
  name: 'priority',
  label: 'Priority',
  description: 'Priority level for the post card (1-10)',
});
