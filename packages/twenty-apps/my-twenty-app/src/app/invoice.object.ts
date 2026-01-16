import { defineObject, FieldType } from 'twenty-sdk';

export default defineObject({
  universalIdentifier: 'd4e5f6a7-89ab-4def-c012-444444444441',
  nameSingular: 'invoice',
  namePlural: 'invoices',
  labelSingular: 'Invoice',
  labelPlural: 'Invoices',
  icon: 'IconFileInvoice',
  fields: [
    {
      universalIdentifier: 'd4e5f6a7-89ab-4def-c012-444444444443',
      type: FieldType.DATE,
      name: 'date',
      label: 'Date',
      description: 'Invoice date',
      icon: 'IconCalendar',
    },
    {
      universalIdentifier: 'd4e5f6a7-89ab-4def-c012-444444444444',
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      description: 'Invoice status',
      icon: 'IconStatusChange',
      defaultValue: "'DRAFT'",
      options: [
        { value: 'DRAFT', label: 'Draft', position: 0, color: 'gray', id: '72b40542-c3eb-470a-a9a9-b22dec9ce0be' },
        { value: 'SENT', label: 'Sent', position: 1, color: 'orange', id: '72b40542-c3eb-470a-a9a9-b22dec9ce0bf' },
        { value: 'PAID', label: 'Paid', position: 2, color: 'green', id: 'b71e50be-9779-456e-9411-7cb4129d3b36' },
      ],
    },
    {
      universalIdentifier: 'd4e5f6a7-89ab-4def-c012-444444444445',
      type: FieldType.NUMBER,
      name: 'totalAmount',
      label: 'Total Amount',
      description: 'Total amount in euros',
      icon: 'IconCurrencyEuro',
    },
    {
      universalIdentifier: 'd4e5f6a7-89ab-4def-c012-444444444446',
      type: FieldType.TEXT,
      name: 'attachmentUrl',
      label: 'Attachment URL',
      description: 'URL to the generated PDF',
      icon: 'IconLink',
    },
  ],
});
