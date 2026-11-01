import { defineView, ViewType } from 'twenty-sdk/define';
import {
  EXPENSE_OBJECT_UNIVERSAL_IDENTIFIER,
  EXPENSE_FIELDS,
} from 'src/objects/expense.object';
export default defineView({
  universalIdentifier: 'b2b87861-fcb9-49b5-b270-f947fa3b465c',
  name: 'Все расходы',
  objectUniversalIdentifier: EXPENSE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconReceipt',
  position: 0,
  fields: [
    {
      universalIdentifier: 'da3b2d43-7d0b-43a6-8059-8f6774df0ee5',
      fieldMetadataUniversalIdentifier: EXPENSE_FIELDS.name,
      position: 0,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'dc086979-b4c8-48cb-acb4-cbade584d33e',
      fieldMetadataUniversalIdentifier: EXPENSE_FIELDS.amount,
      position: 1,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '14270909-9f9d-4665-b5de-ab3cf6797638',
      fieldMetadataUniversalIdentifier: EXPENSE_FIELDS.category,
      position: 2,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '944f8496-e42b-4b78-8ad7-6f34e676d2ee',
      fieldMetadataUniversalIdentifier: EXPENSE_FIELDS.description,
      position: 3,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '298dded0-1002-4380-a992-a4446d1485ea',
      fieldMetadataUniversalIdentifier: EXPENSE_FIELDS.paidOn,
      position: 4,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '4d6de9bc-1554-438c-92af-d5f813f329c2',
      fieldMetadataUniversalIdentifier: EXPENSE_FIELDS.accruedOn,
      position: 5,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'b02c3262-39cb-42b2-a6c1-81acaf5d3bf6',
      fieldMetadataUniversalIdentifier: EXPENSE_FIELDS.costType,
      position: 6,
      isVisible: true,
      size: 180,
    },
  ],
});
