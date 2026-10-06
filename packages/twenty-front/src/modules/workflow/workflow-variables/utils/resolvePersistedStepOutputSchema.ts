import { type OutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { translatePersistedOutputSchemaLabels } from '@/workflow/workflow-variables/utils/translatePersistedOutputSchemaLabels';
import { getOutputSchemaFromValue } from 'twenty-shared/logic-function';
import { isEmptyObject, isPlainObject } from 'twenty-shared/utils';
import {
  type BaseOutputSchemaV2,
  isBaseOutputSchemaV2,
} from 'twenty-shared/workflow';

const AI_AGENT_DEFAULT_OUTPUT_SCHEMA: BaseOutputSchemaV2 = {
  response: {
    isLeaf: true,
    type: 'string',
    label: 'Response',
    value: null,
  },
};

export const resolvePersistedStepOutputSchema = ({
  stepType,
  settings,
}: {
  stepType: string;
  settings?:
    | { outputSchema?: unknown; expectedOutputSchema?: unknown }
    | null
    | undefined;
}): OutputSchemaV2 => {
  const outputSchema = settings?.outputSchema;

  if (isBaseOutputSchemaV2(outputSchema)) {
    return translatePersistedOutputSchemaLabels({ stepType, outputSchema });
  }

  const expectedOutputSchema = settings?.expectedOutputSchema;

  if (
    isPlainObject(expectedOutputSchema) &&
    !isEmptyObject(expectedOutputSchema)
  ) {
    return getOutputSchemaFromValue(expectedOutputSchema);
  }

  if (stepType === 'AI_AGENT') {
    return translatePersistedOutputSchemaLabels({
      stepType,
      outputSchema: AI_AGENT_DEFAULT_OUTPUT_SCHEMA,
    });
  }

  return {};
};
