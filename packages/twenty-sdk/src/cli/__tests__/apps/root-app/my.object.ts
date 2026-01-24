import { FieldType } from '@/application/fields/field-type';
import { defineObject } from '@/application/objects/define-object';

export default defineObject({
  universalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000030',
  nameSingular: 'myNote',
  namePlural: 'myNotes',
  labelSingular: 'My note',
  labelPlural: 'My notes',
  description: 'A simple root-level object',
  icon: 'IconNote',
  fields: [
    {
      universalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000031',
      type: FieldType.TEXT,
      label: 'Title',
      name: 'title',
    },
  ],
});
