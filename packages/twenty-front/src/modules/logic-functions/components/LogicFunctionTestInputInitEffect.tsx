import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { logicFunctionTestDataFamilyState } from '@/workflow/workflow-steps/workflow-actions/code-action/states/logicFunctionTestDataFamilyState';
import { useEffect } from 'react';
import { jsonSchemaToInputSchema } from 'twenty-shared/logic-function';
import { isDefined } from 'twenty-shared/utils';
import { getFunctionInputFromInputSchema } from 'twenty-shared/workflow';
import { useLogicFunctionForm } from '@/logic-functions/hooks/useLogicFunctionForm';

export const LogicFunctionTestInputInitEffect = ({
  logicFunctionId,
}: {
  logicFunctionId: string;
}) => {
  const { logicFunction } = useLogicFunctionForm({ logicFunctionId });

  // Prefer the workflow action schema (already in Twenty's InputSchema form)
  // and fall back to converting the AI tool's JSON Schema when only that
  // surface is configured.
  const workflowInputSchema =
    logicFunction?.workflowActionTriggerSettings?.inputSchema;
  const toolJsonSchema = logicFunction?.toolTriggerSettings?.inputSchema;

  const logicFunctionTestData = useAtomFamilyStateValue(
    logicFunctionTestDataFamilyState,
    logicFunctionId,
  );

  const setLogicFunctionTestData = useSetAtomFamilyState(
    logicFunctionTestDataFamilyState,
    logicFunctionId,
  );

  useEffect(() => {
    if (!logicFunctionTestData.shouldInitInput) {
      return;
    }

    let inputSchema = null;
    if (isDefined(workflowInputSchema)) {
      inputSchema = workflowInputSchema;
    } else if (isDefined(toolJsonSchema)) {
      inputSchema = jsonSchemaToInputSchema(toolJsonSchema);
    }

    if (!isDefined(inputSchema)) {
      return;
    }

    const defaultInput = getFunctionInputFromInputSchema(inputSchema)[0];

    if (!isDefined(defaultInput)) {
      return;
    }

    setLogicFunctionTestData((prev) => ({
      ...prev,
      input: defaultInput as { [field: string]: any },
      shouldInitInput: false,
    }));
  }, [
    workflowInputSchema,
    toolJsonSchema,
    logicFunctionTestData.shouldInitInput,
    setLogicFunctionTestData,
  ]);

  return null;
};
