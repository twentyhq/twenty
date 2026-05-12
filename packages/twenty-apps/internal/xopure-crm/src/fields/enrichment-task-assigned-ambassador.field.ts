import { defineField, FieldType, OnDeleteAction, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { ENRICHMENT_TASK_OBJECT_ID } from '../objects/enrichment-task.object';
import { WORKSPACE_MEMBER_ASSIGNED_ENRICHMENT_TASK_FIELD_ID } from './workspace-member-assigned-enrichment-task.field';

export const ENRICHMENT_TASK_ASSIGNED_AMBASSADOR_FIELD_ID =
  'dc2ef791-250c-52d7-a94f-b8fd77c08403';

export default defineField({
  universalIdentifier: ENRICHMENT_TASK_ASSIGNED_AMBASSADOR_FIELD_ID,
  objectUniversalIdentifier: ENRICHMENT_TASK_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'assignedAmbassador',
  label: 'Assigned Ambassador',
  description: 'The ambassador rep who owns this record.',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: WORKSPACE_MEMBER_ASSIGNED_ENRICHMENT_TASK_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'assignedAmbassadorId',
  },
  icon: 'IconUser',
});
