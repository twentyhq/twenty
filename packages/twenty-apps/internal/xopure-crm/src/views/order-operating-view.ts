import { defineView } from 'twenty-sdk/define';
import { ViewType } from 'twenty-sdk/define';
import { XOPURE_ORDER_NUMBER_FIELD_ID, XOPURE_ORDER_OBJECT_ID, XOPURE_ORDER_STATUS_FIELD_ID } from '../objects/xopure-order.object';

export default defineView({
  universalIdentifier: 'd29c6777-592b-4948-bd75-45c5636fda24',
  name: 'Synced Orders',
  objectUniversalIdentifier: XOPURE_ORDER_OBJECT_ID,
  type: ViewType.TABLE,
  icon: 'IconShoppingBag',
  position: 0,
  fields: [
    { universalIdentifier: 'ac166b2f-8ae0-4f2d-87cc-5c0e42a8c26b', fieldMetadataUniversalIdentifier: XOPURE_ORDER_NUMBER_FIELD_ID, position: 0, isVisible: true, size: 180 },
    { universalIdentifier: 'e322f760-b170-4740-9f8e-b630bd681ff3', fieldMetadataUniversalIdentifier: XOPURE_ORDER_STATUS_FIELD_ID, position: 1, isVisible: true, size: 150 },
  ],
});
