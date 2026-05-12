import { defineField, FieldType, OnDeleteAction, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { XOPURE_CUSTOMER_OBJECT_ID } from '../objects/xopure-customer.object';
import { WORKSPACE_MEMBER_ASSIGNED_CUSTOMER_FIELD_ID } from './workspace-member-assigned-customer.field';

export const CUSTOMER_ASSIGNED_AMBASSADOR_FIELD_ID =
  '921b67de-a706-5619-9747-f59a91aae375';

export default defineField({
  universalIdentifier: CUSTOMER_ASSIGNED_AMBASSADOR_FIELD_ID,
  objectUniversalIdentifier: XOPURE_CUSTOMER_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'assignedAmbassador',
  label: 'Assigned Ambassador',
  description: 'The ambassador rep who owns this record.',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: WORKSPACE_MEMBER_ASSIGNED_CUSTOMER_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'assignedAmbassadorId',
  },
  icon: 'IconUser',
});
