import { defineField, FieldType } from '@/sdk';
import { POST_CARD_UNIVERSAL_IDENTIFIER } from '@/cli/__tests__/apps/rich-app/src/objects/postCard.object';

export default defineField({
  objectUniversalIdentifier: POST_CARD_UNIVERSAL_IDENTIFIER,
  universalIdentifier: '8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e',
  type: FieldType.SELECT,
  name: 'category',
  label: 'Category',
  description: 'Post card category',
  options: [
    { value: 'PERSONAL', label: 'Personal', color: 'blue', position: 0 },
    { value: 'BUSINESS', label: 'Business', color: 'green', position: 1 },
    {
      value: 'PROMOTIONAL',
      label: 'Promotional',
      color: 'orange',
      position: 2,
    },
  ],
});
