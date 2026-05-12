import { defineField, FieldType, OnDeleteAction, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { RETAIL_PROSPECT_OBJECT_ID } from '../objects/retail-prospect.object';
import { WORKSPACE_MEMBER_SUPERVISED_RETAIL_PROSPECT_FIELD_ID } from './workspace-member-supervised-retail-prospect.field';

export const RETAIL_PROSPECT_SUPERVISOR_FIELD_ID =
  'c8d6a264-5023-5676-8f81-4210747a8df6';

export default defineField({
  universalIdentifier: RETAIL_PROSPECT_SUPERVISOR_FIELD_ID,
  objectUniversalIdentifier: RETAIL_PROSPECT_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'supervisor',
  label: 'Supervisor',
  description: 'The ambassador manager who can monitor this record. Denormalized from the assigned ambassador profile.',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: WORKSPACE_MEMBER_SUPERVISED_RETAIL_PROSPECT_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'supervisorId',
  },
  icon: 'IconUserStar',
});
