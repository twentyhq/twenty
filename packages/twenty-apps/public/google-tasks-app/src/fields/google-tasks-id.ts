import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { GOOGLE_TASKS_ID_TASK_FIELD_UNIVERSAL_IDENTIFIER } from "src/constants/universal-identifiers";

export default defineField({
  universalIdentifier: GOOGLE_TASKS_ID_TASK_FIELD_UNIVERSAL_IDENTIFIER,
  name: 'googleTasksId',
  label: 'Google Tasks ID',
  type: FieldType.TEXT,
  isUnique: true,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.task.universalIdentifier,
});
