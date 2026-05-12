import { defineField, FieldType, OnDeleteAction, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { XOPURE_ORDER_OBJECT_ID } from '../objects/xopure-order.object';
import { WORKSPACE_MEMBER_SUPERVISED_ORDER_FIELD_ID } from './workspace-member-supervised-order.field';

export const ORDER_SUPERVISOR_FIELD_ID =
  '735471ed-ab59-5aff-8ab7-bd2eee9ea61a';

export default defineField({
  universalIdentifier: ORDER_SUPERVISOR_FIELD_ID,
  objectUniversalIdentifier: XOPURE_ORDER_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'supervisor',
  label: 'Supervisor',
  description: 'The ambassador manager who can monitor this record. Denormalized from the assigned ambassador profile.',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: WORKSPACE_MEMBER_SUPERVISED_ORDER_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'supervisorId',
  },
  icon: 'IconUserStar',
});
