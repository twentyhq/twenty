import { type WorkflowMcpToolAction } from '@/workflow/types/Workflow';
import { convertFlatVariablesToNestedContext } from '@/workflow/workflow-steps/utils/convertFlatVariablesToNestedContext';
import { t } from '@lingui/core/macro';
import { isPlainObject, resolveInput } from 'twenty-shared/utils';

export const resolveMcpToolTestArguments = ({
  toolInput,
  variableValues,
}: {
  toolInput: WorkflowMcpToolAction['settings']['input']['toolInput'];
  variableValues: { [variablePath: string]: string };
}): Record<string, unknown> => {
  const toolArguments = resolveInput(
    structuredClone(toolInput),
    convertFlatVariablesToNestedContext(variableValues),
  );

  if (!isPlainObject(toolArguments)) {
    throw new Error(t`The tool arguments must resolve to an object`);
  }

  return toolArguments;
};
