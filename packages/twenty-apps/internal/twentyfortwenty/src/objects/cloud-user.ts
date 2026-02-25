import { defineObject } from 'twenty-sdk';

export default defineObject({
  universalIdentifier: '8c53efa7-c6b2-44f5-9d85-3c2d8928a9c0',
  nameSingular: 'cloudUser',
  namePlural: 'cloudUsers',
  labelSingular: 'Cloud User',
  labelPlural: 'Cloud Users',
  icon: 'IconBox',
  fields: [
    // Add your fields here using defineField helper
    // Example:
    // {
    //   universalIdentifier: '...',
    //   type: FieldMetadataType.TEXT,
    //   name: 'description',
    //   label: 'Description',
    // },
  ],
});
