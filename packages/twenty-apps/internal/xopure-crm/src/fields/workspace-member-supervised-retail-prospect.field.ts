import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { RETAIL_PROSPECT_OBJECT_ID } from '../objects/retail-prospect.object';
import { RETAIL_PROSPECT_SUPERVISOR_FIELD_ID } from './retail-prospect-supervisor.field';

export const WORKSPACE_MEMBER_SUPERVISED_RETAIL_PROSPECT_FIELD_ID =
  '544d37ec-e840-54b1-8f1e-e38a8086a551';

export default defineField({
  universalIdentifier: WORKSPACE_MEMBER_SUPERVISED_RETAIL_PROSPECT_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  type: FieldType.RELATION,
  name: 'supervisedRetailProspects',
  label: 'Supervised Retail Prospects',
  relationTargetObjectMetadataUniversalIdentifier: RETAIL_PROSPECT_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: RETAIL_PROSPECT_SUPERVISOR_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
