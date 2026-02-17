import { defineObject, FieldType } from '@/sdk';

const DUPLICATE_ID = 'duplicate-id-0000-0000-000000000001';

export default defineObject({
  universalIdentifier: DUPLICATE_ID,
  nameSingular: 'secondObject',
  namePlural: 'secondObjects',
  labelSingular: 'Second object',
  labelPlural: 'Second objects',
  description: 'Second object with duplicate ID',
  icon: 'IconBox',
  labelIdentifierFieldMetadataUniversalIdentifier:
    'second-field-0000-0000-000000000001',
  fields: [
    {
      universalIdentifier: 'second-field-0000-0000-000000000001',
      type: FieldType.TEXT,
      label: 'Title',
      name: 'title',
    },
  ],
});
