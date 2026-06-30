import { defineField, FieldType } from 'twenty-sdk/define';
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
      id: 'cd751c81-787d-4581-bc51-efe43f0050a7',
      value: 'PERSONAL',
      label: 'Personal',
      color: 'blue',
      position: 0,
    },
    {
      id: 'eec437ca-5beb-41a9-a826-c9a5eca2eef4',
      value: 'BUSINESS',
      label: 'Business',
      color: 'green',
      position: 1,
    },
    {
      id: 'a5baa37d-1047-4972-b6b8-7faae0e3eac1',
      value: 'PROMOTIONAL',
      label: 'Promotional',
      color: 'orange',
      position: 2,
    },
    {
      value: 'OTHER',
      label: 'Other',
      color: 'gray',
      position: 3,
    },
  ],
});
