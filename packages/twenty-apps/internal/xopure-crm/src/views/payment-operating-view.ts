import { defineView, ViewType } from 'twenty-sdk/define';

import {
  XOPURE_PAYMENT_AMOUNT_CENTS_FIELD_ID,
  XOPURE_PAYMENT_LAST_SYNCED_AT_FIELD_ID,
  XOPURE_PAYMENT_NAME_FIELD_ID,
  XOPURE_PAYMENT_OBJECT_ID,
  XOPURE_PAYMENT_PROVIDER_FIELD_ID,
  XOPURE_PAYMENT_RAIL_FIELD_ID,
  XOPURE_PAYMENT_REFUND_CENTS_FIELD_ID,
  XOPURE_PAYMENT_STATUS_FIELD_ID,
} from '../objects/xopure-payment.object';

export default defineView({
  universalIdentifier: '51fd8350-3a1b-4fd2-b584-d79c43e04789',
  name: 'Payment Ledger',
  objectUniversalIdentifier: XOPURE_PAYMENT_OBJECT_ID,
  type: ViewType.TABLE,
  icon: 'IconCreditCard',
  position: 0,
  fields: [
    {
      universalIdentifier: '34d79a6a-d631-494b-b367-b5a534511505',
      fieldMetadataUniversalIdentifier: XOPURE_PAYMENT_NAME_FIELD_ID,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'b7ea662e-8372-4b69-9664-0ec92a1e0d67',
      fieldMetadataUniversalIdentifier: XOPURE_PAYMENT_STATUS_FIELD_ID,
      position: 1,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '0825f9da-a8d2-4594-99ef-9fa9cced1277',
      fieldMetadataUniversalIdentifier: XOPURE_PAYMENT_PROVIDER_FIELD_ID,
      position: 2,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '07fafac5-4b56-493f-a6af-fa8172f51495',
      fieldMetadataUniversalIdentifier: XOPURE_PAYMENT_RAIL_FIELD_ID,
      position: 3,
      isVisible: true,
      size: 120,
    },
    {
      universalIdentifier: 'd665be93-33ad-40e1-b156-dcded7f6620b',
      fieldMetadataUniversalIdentifier: XOPURE_PAYMENT_AMOUNT_CENTS_FIELD_ID,
      position: 4,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: 'b3b8ee12-a123-48e2-a34f-6e1eaaea183d',
      fieldMetadataUniversalIdentifier: XOPURE_PAYMENT_REFUND_CENTS_FIELD_ID,
      position: 5,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: 'd162d88d-1654-4875-bba7-31c1361a4072',
      fieldMetadataUniversalIdentifier: XOPURE_PAYMENT_LAST_SYNCED_AT_FIELD_ID,
      position: 6,
      isVisible: true,
      size: 180,
    },
  ],
});
