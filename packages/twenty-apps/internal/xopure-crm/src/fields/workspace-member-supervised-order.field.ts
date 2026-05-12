import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { XOPURE_ORDER_OBJECT_ID } from '../objects/xopure-order.object';
import { ORDER_SUPERVISOR_FIELD_ID } from './order-supervisor.field';

export const WORKSPACE_MEMBER_SUPERVISED_ORDER_FIELD_ID =
  '9285a4b4-68db-5130-85b3-6de1282651d1';

export default defineField({
  universalIdentifier: WORKSPACE_MEMBER_SUPERVISED_ORDER_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  type: FieldType.RELATION,
  name: 'supervisedOrders',
  label: 'Supervised Orders',
  relationTargetObjectMetadataUniversalIdentifier: XOPURE_ORDER_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: ORDER_SUPERVISOR_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
