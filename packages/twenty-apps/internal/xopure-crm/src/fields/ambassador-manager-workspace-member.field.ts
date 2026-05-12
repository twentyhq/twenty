import { defineField, FieldType, OnDeleteAction, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { XOPURE_AMBASSADOR_OBJECT_ID } from '../objects/xopure-ambassador.object';
import { WORKSPACE_MEMBER_MANAGED_AMBASSADORS_FIELD_ID } from './workspace-member-managed-ambassadors.field';

export const AMBASSADOR_MANAGER_WORKSPACE_MEMBER_FIELD_ID =
  '1843f267-86db-5ea9-b095-11212b0cf401';

export default defineField({
  universalIdentifier: AMBASSADOR_MANAGER_WORKSPACE_MEMBER_FIELD_ID,
  objectUniversalIdentifier: XOPURE_AMBASSADOR_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'managerWorkspaceMember',
  label: 'Manager',
  description: 'The ambassador manager who supervises this ambassador.',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    WORKSPACE_MEMBER_MANAGED_AMBASSADORS_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'managerWorkspaceMemberId',
  },
  icon: 'IconUserStar',
});
