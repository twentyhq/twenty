import { WORKFLOW_PERSISTED_OUTPUT_SCHEMA_LABELS } from '@/workflow/workflow-variables/constants/WorkflowPersistedOutputSchemaLabels';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { type BaseOutputSchemaV2 } from 'twenty-shared/workflow';

// The server builds this label around an object label, so it cannot be an entry of the label list
const CURRENT_ITEM_OF_OBJECT_LABEL_PATTERN = /^Current Item \((.+)\)$/;

const translatePersistedLabel = ({
  stepType,
  key,
  label,
}: {
  stepType: string;
  key: string;
  label: string;
}): string => {
  const persistedLabel = WORKFLOW_PERSISTED_OUTPUT_SCHEMA_LABELS.find(
    (persistedLabel) =>
      persistedLabel.stepType === stepType &&
      persistedLabel.key === key &&
      persistedLabel.label === label,
  );

  if (isDefined(persistedLabel)) {
    return t(persistedLabel.message);
  }

  if (stepType !== 'ITERATOR' || key !== 'currentItem') {
    return label;
  }

  const objectLabel = CURRENT_ITEM_OF_OBJECT_LABEL_PATTERN.exec(label)?.[1];

  return isDefined(objectLabel) ? t`Current Item (${objectLabel})` : label;
};

export const translatePersistedOutputSchemaLabels = ({
  stepType,
  outputSchema,
}: {
  stepType: string;
  outputSchema: BaseOutputSchemaV2;
}): BaseOutputSchemaV2 =>
  Object.fromEntries(
    Object.entries(outputSchema).map(([key, node]) => [
      key,
      {
        ...node,
        label: translatePersistedLabel({ stepType, key, label: node.label }),
      },
    ]),
  );
