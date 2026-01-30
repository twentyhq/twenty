import { defineField, FieldType } from '@/sdk';
import { POST_CARD_UNIVERSAL_IDENTIFIER } from '@/cli/__tests__/apps/rich-app/src/objects/postCard.object';
import { POST_CARD_EXTENSION_CATEGORY_FIELD_ID } from '@/cli/__tests__/apps/rich-app/src/fields/postCardNumber.field';

export default defineField({
  objectUniversalIdentifier: POST_CARD_UNIVERSAL_IDENTIFIER,
  universalIdentifier: POST_CARD_EXTENSION_CATEGORY_FIELD_ID,
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
