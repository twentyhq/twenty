import { defineField, FieldType } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: '86ea975c-3ce2-4fe4-a5de-b2731c776f90',
  name: 'companionBillingState',
  label: 'Desktop recording billing state',
  type: FieldType.RAW_JSON,
  objectUniversalIdentifier: 'ce19efb9-710f-45b2-b141-473abbeea60b',
  description: 'Durable recording charge and delivery receipt.',
  isNullable: true,
  isUIEditable: false,
  icon: 'IconCreditCard',
});
