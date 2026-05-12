import { defineField, FieldType, OnDeleteAction, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { INFLUENCER_PROSPECT_OBJECT_ID } from '../objects/influencer-prospect.object';
import { WORKSPACE_MEMBER_SUPERVISED_INFLUENCER_PROSPECT_FIELD_ID } from './workspace-member-supervised-influencer-prospect.field';

export const INFLUENCER_PROSPECT_SUPERVISOR_FIELD_ID =
  '8152c359-5d00-558d-b300-5329870d8756';

export default defineField({
  universalIdentifier: INFLUENCER_PROSPECT_SUPERVISOR_FIELD_ID,
  objectUniversalIdentifier: INFLUENCER_PROSPECT_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'supervisor',
  label: 'Supervisor',
  description: 'The ambassador manager who can monitor this record. Denormalized from the assigned ambassador profile.',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: WORKSPACE_MEMBER_SUPERVISED_INFLUENCER_PROSPECT_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'supervisorId',
  },
  icon: 'IconUserStar',
});
