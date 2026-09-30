import { defineObject, FieldType } from 'twenty-sdk/define';

export const CHECKLIST_UNIVERSAL_IDENTIFIER =
  '028c9482-22e8-4674-a231-90b7ae329061';

export default defineObject({
  universalIdentifier: CHECKLIST_UNIVERSAL_IDENTIFIER,
  nameSingular: 'checklist',
  namePlural: 'checklists',
  labelSingular: 'Checklist',
  labelPlural: 'Checklists',
  description: 'A checklist whose items are stored in a JSON field',
  icon: 'IconChecklist',
  fields: [
    {
      universalIdentifier: '10cd3c89-065e-4539-8e58-2d634fe62076',
      type: FieldType.RAW_JSON,
      label: 'Items',
      name: 'items',
    },
  ],
});
