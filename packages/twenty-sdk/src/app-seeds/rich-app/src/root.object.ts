import { defineObject, FieldType } from '@/sdk';

export default defineObject({
  universalIdentifier: 'b0b1b2b3-b4b5-4000-8000-000000000001',
  nameSingular: 'rootNote',
  namePlural: 'rootNotes',
  labelSingular: 'Root note',
  labelPlural: 'Root notes',
  description: 'A simple root-level object',
  icon: 'IconNote',
  labelIdentifierFieldMetadataUniversalIdentifier:
    'b0b1b2b3-b4b5-4000-8000-000000000002',
  fields: [
    {
      universalIdentifier: 'b0b1b2b3-b4b5-4000-8000-000000000002',
      type: FieldType.TEXT,
      label: 'Title',
      name: 'title',
    },
    {
      universalIdentifier: 'b0b1b2b3-b4b5-4000-8000-000000000003',
      type: FieldType.TEXT,
      label: 'Body',
      name: 'body',
    },
  ],
});
