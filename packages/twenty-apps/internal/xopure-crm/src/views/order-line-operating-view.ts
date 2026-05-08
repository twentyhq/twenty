import { defineView, ViewType } from 'twenty-sdk/define';
import { XOPURE_ORDER_LINE_NAME_FIELD_ID, XOPURE_ORDER_LINE_OBJECT_ID, XOPURE_ORDER_LINE_SKU_FIELD_ID } from '../objects/xopure-order-line.object';

export default defineView({
  universalIdentifier: '8abfefe4-aef3-4eea-a7fd-964f3d7d49d2',
  name: 'Synced Order Lines',
  objectUniversalIdentifier: XOPURE_ORDER_LINE_OBJECT_ID,
  type: ViewType.TABLE,
  icon: 'IconListDetails',
  position: 0,
  fields: [
    { universalIdentifier: 'f1a9390b-c269-46cd-a339-cca4626bdf51', fieldMetadataUniversalIdentifier: XOPURE_ORDER_LINE_NAME_FIELD_ID, position: 0, isVisible: true, size: 220 },
    { universalIdentifier: '32888da1-1c24-4d7f-adb2-dcfaca3b003e', fieldMetadataUniversalIdentifier: XOPURE_ORDER_LINE_SKU_FIELD_ID, position: 1, isVisible: true, size: 140 },
  ],
});
