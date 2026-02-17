import { defineObject, FieldType } from '@/sdk';

const DUPLICATE_ID = 'duplicate-id-0000-0000-000000000001';

export default defineObject({
  universalIdentifier: DUPLICATE_ID,
  nameSingular: 'firstObject',
  namePlural: 'firstObjects',
  labelSingular: 'First object',
  labelPlural: 'First objects',
  description: 'First object with duplicate ID',
  icon: 'IconBox',
  labelIdentifierFieldMetadataUniversalIdentifier:
    'first-field-0000-0000-000000000001',
  fields: [
    {
      universalIdentifier: 'first-field-0000-0000-000000000001',
      type: FieldType.TEXT,
      label: 'Name',
      name: 'name',
    },
  ],
});
