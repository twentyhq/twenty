import { WORKFLOW_PERSISTED_OUTPUT_SCHEMA_LABELS } from '@/workflow/workflow-variables/constants/WorkflowPersistedOutputSchemaLabels';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { type BaseOutputSchemaV2 } from 'twenty-shared/workflow';

// The server builds this label around an object label, so it cannot be a key of the label map
const CURRENT_ITEM_OF_OBJECT_LABEL_PATTERN = /^Current Item \((.+)\)$/;

const translatePersistedLabel = (label: string): string => {
  if (Object.hasOwn(WORKFLOW_PERSISTED_OUTPUT_SCHEMA_LABELS, label)) {
    return t(WORKFLOW_PERSISTED_OUTPUT_SCHEMA_LABELS[label]);
  }

  const objectLabel = CURRENT_ITEM_OF_OBJECT_LABEL_PATTERN.exec(label)?.[1];

  return isDefined(objectLabel) ? t`Current Item (${objectLabel})` : label;
};

export const translatePersistedOutputSchemaLabels = (
  outputSchema: BaseOutputSchemaV2,
): BaseOutputSchemaV2 => {
  const translatedOutputSchema: BaseOutputSchemaV2 = {};

  for (const [key, node] of Object.entries(outputSchema)) {
    translatedOutputSchema[key] = {
      ...node,
      label: translatePersistedLabel(node.label),
    };
  }

  return translatedOutputSchema;
};
