import { defineField, FieldType, OnDeleteAction, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { XOPURE_COMMISSION_OBJECT_ID } from '../objects/xopure-commission.object';
import { WORKSPACE_MEMBER_ASSIGNED_COMMISSION_FIELD_ID } from './workspace-member-assigned-commission.field';

export const COMMISSION_ASSIGNED_AMBASSADOR_FIELD_ID =
  '432c1a13-c334-59b3-9816-fa5f6832066f';

export default defineField({
  universalIdentifier: COMMISSION_ASSIGNED_AMBASSADOR_FIELD_ID,
  objectUniversalIdentifier: XOPURE_COMMISSION_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'assignedAmbassador',
  label: 'Assigned Ambassador',
  description: 'The ambassador rep who owns this record.',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: WORKSPACE_MEMBER_ASSIGNED_COMMISSION_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'assignedAmbassadorId',
  },
  icon: 'IconUser',
});
