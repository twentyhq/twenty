import { defineField, FieldType, OnDeleteAction, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { XOPURE_COMMISSION_OBJECT_ID } from '../objects/xopure-commission.object';
import { WORKSPACE_MEMBER_SUPERVISED_COMMISSION_FIELD_ID } from './workspace-member-supervised-commission.field';

export const COMMISSION_SUPERVISOR_FIELD_ID =
  'cacbbe48-2077-5e94-8974-5aea94042e79';

export default defineField({
  universalIdentifier: COMMISSION_SUPERVISOR_FIELD_ID,
  objectUniversalIdentifier: XOPURE_COMMISSION_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'supervisor',
  label: 'Supervisor',
  description: 'The ambassador manager who can monitor this record. Denormalized from the assigned ambassador profile.',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: WORKSPACE_MEMBER_SUPERVISED_COMMISSION_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'supervisorId',
  },
  icon: 'IconUserStar',
});
