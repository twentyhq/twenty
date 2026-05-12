import { defineField, FieldType, OnDeleteAction, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { RETAIL_PROSPECT_OBJECT_ID } from '../objects/retail-prospect.object';
import { WORKSPACE_MEMBER_ASSIGNED_RETAIL_PROSPECT_FIELD_ID } from './workspace-member-assigned-retail-prospect.field';

export const RETAIL_PROSPECT_ASSIGNED_AMBASSADOR_FIELD_ID =
  'aeb422a4-998d-5624-b8ab-8f4ba969c975';

export default defineField({
  universalIdentifier: RETAIL_PROSPECT_ASSIGNED_AMBASSADOR_FIELD_ID,
  objectUniversalIdentifier: RETAIL_PROSPECT_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'assignedAmbassador',
  label: 'Assigned Ambassador',
  description: 'The ambassador rep who owns this record.',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: WORKSPACE_MEMBER_ASSIGNED_RETAIL_PROSPECT_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'assignedAmbassadorId',
  },
  icon: 'IconUser',
});
