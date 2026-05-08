import { defineView } from 'twenty-sdk/define';
import { ViewType } from 'twenty-sdk/define';
import { XOPURE_CUSTOMER_LTV_FIELD_ID, XOPURE_CUSTOMER_NAME_FIELD_ID, XOPURE_CUSTOMER_OBJECT_ID, XOPURE_CUSTOMER_ORDER_COUNT_FIELD_ID, XOPURE_CUSTOMER_STATUS_FIELD_ID, XOPURE_CUSTOMER_TAGS_FIELD_ID } from '../objects/xopure-customer.object';

export default defineView({
  universalIdentifier: 'fafda40d-04d1-4242-a350-9bd13456072d',
  name: 'Customer Command Center',
  objectUniversalIdentifier: XOPURE_CUSTOMER_OBJECT_ID,
  type: ViewType.TABLE,
  icon: 'IconUserHeart',
  position: 0,
  fields: [
    { universalIdentifier: 'c10f318a-5d56-4f9f-b577-7fa064e36fa1', fieldMetadataUniversalIdentifier: XOPURE_CUSTOMER_NAME_FIELD_ID, position: 0, isVisible: true, size: 220 },
    { universalIdentifier: '15fe2b5e-77ed-4945-91ea-cd662c45413f', fieldMetadataUniversalIdentifier: XOPURE_CUSTOMER_STATUS_FIELD_ID, position: 1, isVisible: true, size: 140 },
    { universalIdentifier: 'fbfdc45b-0f73-4c28-b03e-071f128bb7d8', fieldMetadataUniversalIdentifier: XOPURE_CUSTOMER_TAGS_FIELD_ID, position: 2, isVisible: true, size: 220 },
    { universalIdentifier: 'a245fe2d-cd59-4a2c-bd24-eab82d3a507d', fieldMetadataUniversalIdentifier: XOPURE_CUSTOMER_LTV_FIELD_ID, position: 3, isVisible: true, size: 140 },
    { universalIdentifier: '803654c1-8060-4ce2-979c-148384da4a95', fieldMetadataUniversalIdentifier: XOPURE_CUSTOMER_ORDER_COUNT_FIELD_ID, position: 4, isVisible: true, size: 120 },
  ],
});
