import { defineField, FieldType, OnDeleteAction, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { INFLUENCER_PROSPECT_OBJECT_ID } from '../objects/influencer-prospect.object';
import { WORKSPACE_MEMBER_ASSIGNED_INFLUENCER_PROSPECT_FIELD_ID } from './workspace-member-assigned-influencer-prospect.field';

export const INFLUENCER_PROSPECT_ASSIGNED_AMBASSADOR_FIELD_ID =
  '00b18d96-e9ba-5596-b167-d847cd9cbcc8';

export default defineField({
  universalIdentifier: INFLUENCER_PROSPECT_ASSIGNED_AMBASSADOR_FIELD_ID,
  objectUniversalIdentifier: INFLUENCER_PROSPECT_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'assignedAmbassador',
  label: 'Assigned Ambassador',
  description: 'The ambassador rep who owns this record.',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: WORKSPACE_MEMBER_ASSIGNED_INFLUENCER_PROSPECT_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'assignedAmbassadorId',
  },
  icon: 'IconUser',
});
