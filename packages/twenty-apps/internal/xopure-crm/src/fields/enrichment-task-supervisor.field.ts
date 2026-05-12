import { defineField, FieldType, OnDeleteAction, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { ENRICHMENT_TASK_OBJECT_ID } from '../objects/enrichment-task.object';
import { WORKSPACE_MEMBER_SUPERVISED_ENRICHMENT_TASK_FIELD_ID } from './workspace-member-supervised-enrichment-task.field';

export const ENRICHMENT_TASK_SUPERVISOR_FIELD_ID =
  'a5a35ad1-95d6-5c55-bb55-f556ee9afdc7';

export default defineField({
  universalIdentifier: ENRICHMENT_TASK_SUPERVISOR_FIELD_ID,
  objectUniversalIdentifier: ENRICHMENT_TASK_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'supervisor',
  label: 'Supervisor',
  description: 'The ambassador manager who can monitor this record. Denormalized from the assigned ambassador profile.',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: WORKSPACE_MEMBER_SUPERVISED_ENRICHMENT_TASK_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'supervisorId',
  },
  icon: 'IconUserStar',
});
