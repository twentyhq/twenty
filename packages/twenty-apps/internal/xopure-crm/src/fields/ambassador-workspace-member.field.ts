import { defineField, FieldType, OnDeleteAction, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { XOPURE_AMBASSADOR_OBJECT_ID } from '../objects/xopure-ambassador.object';
import { WORKSPACE_MEMBER_AMBASSADOR_PROFILE_FIELD_ID } from './workspace-member-ambassador-profile.field';

export const AMBASSADOR_WORKSPACE_MEMBER_FIELD_ID =
  '00d47c7b-b92f-5ab1-83a5-36be70e8f58b';

export default defineField({
  universalIdentifier: AMBASSADOR_WORKSPACE_MEMBER_FIELD_ID,
  objectUniversalIdentifier: XOPURE_AMBASSADOR_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'workspaceMember',
  label: 'Workspace Member',
  description: 'The CRM user account for this ambassador.',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    WORKSPACE_MEMBER_AMBASSADOR_PROFILE_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'workspaceMemberId',
  },
  icon: 'IconUser',
});
