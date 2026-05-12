import { defineField, FieldType, OnDeleteAction, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { XOPURE_ORDER_OBJECT_ID } from '../objects/xopure-order.object';
import { WORKSPACE_MEMBER_ASSIGNED_ORDER_FIELD_ID } from './workspace-member-assigned-order.field';

export const ORDER_ASSIGNED_AMBASSADOR_FIELD_ID =
  '8cbe00a9-5cc7-5a6f-9e82-3e5c24ca8800';

export default defineField({
  universalIdentifier: ORDER_ASSIGNED_AMBASSADOR_FIELD_ID,
  objectUniversalIdentifier: XOPURE_ORDER_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'assignedAmbassador',
  label: 'Assigned Ambassador',
  description: 'The ambassador rep who owns this record.',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: WORKSPACE_MEMBER_ASSIGNED_ORDER_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'assignedAmbassadorId',
  },
  icon: 'IconUser',
});
