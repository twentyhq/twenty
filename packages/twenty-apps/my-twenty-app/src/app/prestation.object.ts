import { defineObject, FieldType } from 'twenty-sdk';

export default defineObject({
  universalIdentifier: 'b2c3d4e5-6789-4bcd-aef0-222222222221',
  nameSingular: 'prestation',
  namePlural: 'prestations',
  labelSingular: 'Prestation',
  labelPlural: 'Prestations',
  icon: 'IconReceipt',
  fields: [
    {
      universalIdentifier: 'b2c3d4e5-6789-4bcd-aef0-222222222223',
      type: FieldType.TEXT,
      name: 'description',
      label: 'Description',
      description: 'Service description',
      icon: 'IconNotes',
    },
    {
      universalIdentifier: 'b2c3d4e5-6789-4bcd-aef0-222222222224',
      type: FieldType.NUMBER,
      name: 'unitPrice',
      label: 'Unit Price',
      description: 'Price in euros',
      icon: 'IconCurrencyEuro',
    }
  ],
});
