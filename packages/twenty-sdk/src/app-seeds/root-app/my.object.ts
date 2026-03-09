import { FieldType, defineObject } from '@/sdk';

export default defineObject({
  universalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000030',
  nameSingular: 'myNote',
  namePlural: 'myNotes',
  labelSingular: 'My note',
  labelPlural: 'My notes',
  description: 'A simple root-level object',
  icon: 'IconNote',
  labelIdentifierFieldMetadataUniversalIdentifier:
    'e1e2e3e4-e5e6-4000-8000-000000000031',
  fields: [
    {
      universalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000031',
      type: FieldType.TEXT,
      label: 'Title',
      name: 'title',
    },
  ],
});
