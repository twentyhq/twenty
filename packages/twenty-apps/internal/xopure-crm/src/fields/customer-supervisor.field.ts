import { defineField, FieldType, OnDeleteAction, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { XOPURE_CUSTOMER_OBJECT_ID } from '../objects/xopure-customer.object';
import { WORKSPACE_MEMBER_SUPERVISED_CUSTOMER_FIELD_ID } from './workspace-member-supervised-customer.field';

export const CUSTOMER_SUPERVISOR_FIELD_ID =
  '05e7e26e-d583-50a5-890b-bd7a5ad20e22';

export default defineField({
  universalIdentifier: CUSTOMER_SUPERVISOR_FIELD_ID,
  objectUniversalIdentifier: XOPURE_CUSTOMER_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'supervisor',
  label: 'Supervisor',
  description: 'The ambassador manager who can monitor this record. Denormalized from the assigned ambassador profile.',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: WORKSPACE_MEMBER_SUPERVISED_CUSTOMER_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'supervisorId',
  },
  icon: 'IconUserStar',
});
