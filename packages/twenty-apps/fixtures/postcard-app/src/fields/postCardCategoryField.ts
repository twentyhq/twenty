import { defineField, FieldType } from 'twenty-sdk';
import { POST_CARD_UNIVERSAL_IDENTIFIER } from '../objects/post-card.object';

export default defineField({
  objectUniversalIdentifier: POST_CARD_UNIVERSAL_IDENTIFIER,
  universalIdentifier: 'b602dbd9-e511-49ce-b6d3-b697218dc69c',
  type: FieldType.SELECT,
  name: 'category',
  label: 'Category',
  description: 'Post card category',
  options: [
    {
      id: 'c1d2e3f4-0001-4000-8000-000000000001',
      value: 'PERSONAL',
      label: 'Personal',
      color: 'blue',
      position: 0,
    },
    {
      id: 'c1d2e3f4-0002-4000-8000-000000000002',
      value: 'BUSINESS',
      label: 'Business',
      color: 'green',
      position: 1,
    },
    {
      id: 'c1d2e3f4-0003-4000-8000-000000000003',
      value: 'PROMOTIONAL',
      label: 'Promotional',
      color: 'orange',
      position: 2,
    },
  ],
});
