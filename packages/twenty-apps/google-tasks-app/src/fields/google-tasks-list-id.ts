import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { GOOGLE_TASKS_LIST_ID_TASK_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: GOOGLE_TASKS_LIST_ID_TASK_FIELD_UNIVERSAL_IDENTIFIER,
  name: 'googleTasksListId',
  label: 'Google Tasks list ID',
  type: FieldType.TEXT,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.task.universalIdentifier,
});
