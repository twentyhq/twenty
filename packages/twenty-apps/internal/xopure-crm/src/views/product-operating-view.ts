import { defineView, ViewType } from 'twenty-sdk/define';
import { XOPURE_PRODUCT_NAME_FIELD_ID, XOPURE_PRODUCT_OBJECT_ID, XOPURE_PRODUCT_SKU_FIELD_ID, XOPURE_PRODUCT_STATUS_FIELD_ID } from '../objects/xopure-product.object';

export default defineView({
  universalIdentifier: '4360b9ad-b730-4bb6-ba21-2979ec6eb9c9',
  name: 'Synced Products',
  objectUniversalIdentifier: XOPURE_PRODUCT_OBJECT_ID,
  type: ViewType.TABLE,
  icon: 'IconBottle',
  position: 0,
  fields: [
    { universalIdentifier: 'a73ed828-b58e-4194-b0eb-04cbdde1842a', fieldMetadataUniversalIdentifier: XOPURE_PRODUCT_NAME_FIELD_ID, position: 0, isVisible: true, size: 220 },
    { universalIdentifier: '40b08bc6-3ebe-4f08-b6e5-79a8341d35b4', fieldMetadataUniversalIdentifier: XOPURE_PRODUCT_SKU_FIELD_ID, position: 1, isVisible: true, size: 140 },
    { universalIdentifier: 'fa5c2e95-15b0-4ab3-bd67-e18d88f68987', fieldMetadataUniversalIdentifier: XOPURE_PRODUCT_STATUS_FIELD_ID, position: 2, isVisible: true, size: 150 },
  ],
});
