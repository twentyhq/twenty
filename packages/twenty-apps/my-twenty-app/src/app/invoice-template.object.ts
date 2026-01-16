import { defineObject, FieldType } from 'twenty-sdk';

export default defineObject({
  universalIdentifier: 'c3d4e5f6-789a-4cde-bf01-333333333331',
  nameSingular: 'invoiceTemplate',
  namePlural: 'invoiceTemplates',
  labelSingular: 'Invoice Template',
  labelPlural: 'Invoice Templates',
  icon: 'IconTemplate',
  fields: [
    // {
    //   universalIdentifier: 'c3d4e5f6-789a-4cde-bf01-333333333332',
    //   type: FieldType.TEXT,
    //   name: 'name',
    //   label: 'Name',
    //   description: 'Template name',
    //   icon: 'IconAbc',
    // },
    {
      universalIdentifier: 'c3d4e5f6-789a-4cde-bf01-333333333333',
      type: FieldType.TEXT,
      name: 'template',
      label: 'Template',
      description: 'pdfme JSON template definition',
      icon: 'IconCode',
    },
  ],
});
