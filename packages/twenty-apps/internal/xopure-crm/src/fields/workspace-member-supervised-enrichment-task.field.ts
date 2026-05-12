import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { ENRICHMENT_TASK_OBJECT_ID } from '../objects/enrichment-task.object';
import { ENRICHMENT_TASK_SUPERVISOR_FIELD_ID } from './enrichment-task-supervisor.field';

export const WORKSPACE_MEMBER_SUPERVISED_ENRICHMENT_TASK_FIELD_ID =
  'af3022ee-45f6-5f4a-be39-655e20ce4d0a';

export default defineField({
  universalIdentifier: WORKSPACE_MEMBER_SUPERVISED_ENRICHMENT_TASK_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  type: FieldType.RELATION,
  name: 'supervisedEnrichmentTasks',
  label: 'Supervised Enrichment Tasks',
  relationTargetObjectMetadataUniversalIdentifier: ENRICHMENT_TASK_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: ENRICHMENT_TASK_SUPERVISOR_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
