import { defineObject, FieldType } from 'twenty-sdk/define';

export const WORKFLOW_RUN_TRIGGER_UNIVERSAL_IDENTIFIER =
  'c92915ed-c861-413a-9096-aa514476ce2d';

export const WORKFLOW_RUN_TRIGGER_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  'e89a0a8d-b7b3-404b-8dd5-10a7ed8bdaab';

export default defineObject({
  universalIdentifier: WORKFLOW_RUN_TRIGGER_UNIVERSAL_IDENTIFIER,
  nameSingular: 'workflowRunTrigger',
  namePlural: 'workflowRunTriggers',
  labelSingular: 'Workflow run trigger',
  labelPlural: 'Workflow run triggers',
  description:
    'Creating a record fires the run-in-workflow logic function via database event',
  icon: 'IconBolt',
  labelIdentifierFieldMetadataUniversalIdentifier:
    WORKFLOW_RUN_TRIGGER_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: WORKFLOW_RUN_TRIGGER_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Name',
      description: 'Workflow run trigger name',
      icon: 'IconAbc',
      name: 'name',
    },
  ],
});
