import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { ENRICHMENT_TASK_OBJECT_ID } from '../objects/enrichment-task.object';
import { ENRICHMENT_TASK_ASSIGNED_AMBASSADOR_FIELD_ID } from './enrichment-task-assigned-ambassador.field';

export const WORKSPACE_MEMBER_ASSIGNED_ENRICHMENT_TASK_FIELD_ID =
  '7fda8555-9c18-5a26-9931-93916ccc20a9';

export default defineField({
  universalIdentifier: WORKSPACE_MEMBER_ASSIGNED_ENRICHMENT_TASK_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  type: FieldType.RELATION,
  name: 'assignedEnrichmentTasks',
  label: 'Assigned Enrichment Tasks',
  relationTargetObjectMetadataUniversalIdentifier: ENRICHMENT_TASK_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: ENRICHMENT_TASK_ASSIGNED_AMBASSADOR_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
