import { extendObject } from '@/application/objects/extend-object';
import { FieldType } from '@/application/fields/field-type';

export const POST_CARD_EXTENSION_PRIORITY_FIELD_ID =
  '7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d';

export const POST_CARD_EXTENSION_CATEGORY_FIELD_ID =
  '8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e';

export default extendObject({
  targetObject: {
    nameSingular: 'postCard',
  },
  fields: [
    {
      universalIdentifier: POST_CARD_EXTENSION_PRIORITY_FIELD_ID,
      type: FieldType.NUMBER,
      name: 'priority',
      label: 'Priority',
      description: 'Priority level for the post card (1-10)',
    },
    {
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
    },
  ],
});
