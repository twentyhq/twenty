import { defineView, ViewType } from 'twenty-sdk/define';

import {
  XOPURE_PAYOUT_BATCH_COMMISSION_COUNT_FIELD_ID,
  XOPURE_PAYOUT_BATCH_COMPLETED_AT_FIELD_ID,
  XOPURE_PAYOUT_BATCH_NAME_FIELD_ID,
  XOPURE_PAYOUT_BATCH_OBJECT_ID,
  XOPURE_PAYOUT_BATCH_STATUS_FIELD_ID,
  XOPURE_PAYOUT_BATCH_SUBMITTED_AT_FIELD_ID,
  XOPURE_PAYOUT_BATCH_TOTAL_CENTS_FIELD_ID,
} from '../objects/xopure-payout-batch.object';

export default defineView({
  universalIdentifier: 'b0348e6b-d3a2-4aeb-9589-b5edd6301ded',
  name: 'Payout Batch Queue',
  objectUniversalIdentifier: XOPURE_PAYOUT_BATCH_OBJECT_ID,
  type: ViewType.TABLE,
  icon: 'IconCashBanknote',
  position: 0,
  fields: [
    {
      universalIdentifier: 'a27c3589-0a4b-4c0e-a2b2-adab0da56c08',
      fieldMetadataUniversalIdentifier: XOPURE_PAYOUT_BATCH_NAME_FIELD_ID,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '496e3a2a-c195-4469-9201-25d7e22a0b90',
      fieldMetadataUniversalIdentifier: XOPURE_PAYOUT_BATCH_STATUS_FIELD_ID,
      position: 1,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '3ae3c8b2-5b71-4779-b6f8-e1f84baeb668',
      fieldMetadataUniversalIdentifier: XOPURE_PAYOUT_BATCH_TOTAL_CENTS_FIELD_ID,
      position: 2,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: 'b19d0583-a2ef-4bf9-9e79-e2fce0b867cd',
      fieldMetadataUniversalIdentifier:
        XOPURE_PAYOUT_BATCH_COMMISSION_COUNT_FIELD_ID,
      position: 3,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: 'a6912445-62b9-4d26-8174-7645ef2ced6f',
      fieldMetadataUniversalIdentifier: XOPURE_PAYOUT_BATCH_SUBMITTED_AT_FIELD_ID,
      position: 4,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '38c47ff0-f67c-4e5e-9fb4-27acea5348cc',
      fieldMetadataUniversalIdentifier: XOPURE_PAYOUT_BATCH_COMPLETED_AT_FIELD_ID,
      position: 5,
      isVisible: true,
      size: 180,
    },
  ],
});
