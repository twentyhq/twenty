import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { XOPURE_ORDER_OBJECT_ID } from '../objects/xopure-order.object';
import { ORDER_ASSIGNED_AMBASSADOR_FIELD_ID } from './order-assigned-ambassador.field';

export const WORKSPACE_MEMBER_ASSIGNED_ORDER_FIELD_ID =
  'a1ad8dc1-62eb-5a84-9938-5f1a4916623a';

export default defineField({
  universalIdentifier: WORKSPACE_MEMBER_ASSIGNED_ORDER_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  type: FieldType.RELATION,
  name: 'assignedOrders',
  label: 'Assigned Orders',
  relationTargetObjectMetadataUniversalIdentifier: XOPURE_ORDER_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: ORDER_ASSIGNED_AMBASSADOR_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
