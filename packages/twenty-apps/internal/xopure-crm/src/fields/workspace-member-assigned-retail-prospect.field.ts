import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { RETAIL_PROSPECT_OBJECT_ID } from '../objects/retail-prospect.object';
import { RETAIL_PROSPECT_ASSIGNED_AMBASSADOR_FIELD_ID } from './retail-prospect-assigned-ambassador.field';

export const WORKSPACE_MEMBER_ASSIGNED_RETAIL_PROSPECT_FIELD_ID =
  '1cd36fe0-4489-5528-a173-e5dff45f4419';

export default defineField({
  universalIdentifier: WORKSPACE_MEMBER_ASSIGNED_RETAIL_PROSPECT_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  type: FieldType.RELATION,
  name: 'assignedRetailProspects',
  label: 'Assigned Retail Prospects',
  relationTargetObjectMetadataUniversalIdentifier: RETAIL_PROSPECT_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: RETAIL_PROSPECT_ASSIGNED_AMBASSADOR_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
