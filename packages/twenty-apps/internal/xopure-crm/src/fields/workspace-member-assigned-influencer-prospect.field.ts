import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { INFLUENCER_PROSPECT_OBJECT_ID } from '../objects/influencer-prospect.object';
import { INFLUENCER_PROSPECT_ASSIGNED_AMBASSADOR_FIELD_ID } from './influencer-prospect-assigned-ambassador.field';

export const WORKSPACE_MEMBER_ASSIGNED_INFLUENCER_PROSPECT_FIELD_ID =
  '36a6dfe5-2327-57ba-b4c1-b919a222bb00';

export default defineField({
  universalIdentifier: WORKSPACE_MEMBER_ASSIGNED_INFLUENCER_PROSPECT_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  type: FieldType.RELATION,
  name: 'assignedInfluencerProspects',
  label: 'Assigned Influencer Prospects',
  relationTargetObjectMetadataUniversalIdentifier: INFLUENCER_PROSPECT_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: INFLUENCER_PROSPECT_ASSIGNED_AMBASSADOR_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
