import { type WorkflowMcpToolAction } from '@/workflow/types/Workflow';
import { convertFlatVariablesToNestedContext } from '@/workflow/workflow-steps/utils/convertFlatVariablesToNestedContext';
import { t } from '@lingui/core/macro';
import { CustomError, isPlainObject, resolveInput } from 'twenty-shared/utils';

export const resolveMcpToolTestArgumentsOrThrow = ({
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
    throw new CustomError(
      t`The tool arguments must resolve to an object`,
      'MCP_TOOL_TEST_ARGUMENTS_NOT_AN_OBJECT',
    );
  }

  return toolArguments;
};
