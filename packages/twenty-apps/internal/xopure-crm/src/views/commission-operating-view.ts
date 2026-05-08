import { defineView } from 'twenty-sdk/define';
import { ViewType } from 'twenty-sdk/define';
import { XOPURE_COMMISSION_NAME_FIELD_ID, XOPURE_COMMISSION_OBJECT_ID, XOPURE_COMMISSION_STATUS_FIELD_ID } from '../objects/xopure-commission.object';

export default defineView({
  universalIdentifier: '330a4920-10de-493a-9c77-d74dbe689d0f',
  name: 'Commission Pipeline',
  objectUniversalIdentifier: XOPURE_COMMISSION_OBJECT_ID,
  type: ViewType.TABLE,
  icon: 'IconReceiptDollar',
  position: 0,
  fields: [
    { universalIdentifier: '47208373-c90b-4f87-9b55-2af96081d256', fieldMetadataUniversalIdentifier: XOPURE_COMMISSION_NAME_FIELD_ID, position: 0, isVisible: true, size: 220 },
    { universalIdentifier: '2e678cf5-6d62-4c5e-88cc-d16974ab1c2c', fieldMetadataUniversalIdentifier: XOPURE_COMMISSION_STATUS_FIELD_ID, position: 1, isVisible: true, size: 160 },
  ],
});
