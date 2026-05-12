import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { INFLUENCER_PROSPECT_OBJECT_ID } from '../objects/influencer-prospect.object';
import { INFLUENCER_PROSPECT_SUPERVISOR_FIELD_ID } from './influencer-prospect-supervisor.field';

export const WORKSPACE_MEMBER_SUPERVISED_INFLUENCER_PROSPECT_FIELD_ID =
  '30acc14f-0dbe-53b6-bf2a-bb8f1ff12dbf';

export default defineField({
  universalIdentifier: WORKSPACE_MEMBER_SUPERVISED_INFLUENCER_PROSPECT_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  type: FieldType.RELATION,
  name: 'supervisedInfluencerProspects',
  label: 'Supervised Influencer Prospects',
  relationTargetObjectMetadataUniversalIdentifier: INFLUENCER_PROSPECT_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: INFLUENCER_PROSPECT_SUPERVISOR_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
