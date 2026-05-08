import { defineField, FieldType, OnDeleteAction, RelationType } from 'twenty-sdk/define';
import { XOPURE_CUSTOMER_OBJECT_ID } from '../objects/xopure-customer.object';
import { XOPURE_ORDER_OBJECT_ID } from '../objects/xopure-order.object';
import { CUSTOMER_ON_ORDER_FIELD_ID, ORDERS_ON_CUSTOMER_FIELD_ID } from './customer-orders-on-customer.field';

export default defineField({
  universalIdentifier: CUSTOMER_ON_ORDER_FIELD_ID,
  objectUniversalIdentifier: XOPURE_ORDER_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'customer',
  label: 'Customer',
  relationTargetObjectMetadataUniversalIdentifier: XOPURE_CUSTOMER_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: ORDERS_ON_CUSTOMER_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'customerId',
  },
});
