import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { logicFunctionTestDataFamilyState } from '@/workflow/workflow-steps/workflow-actions/code-action/states/logicFunctionTestDataFamilyState';
import { useEffect } from 'react';
import { type InputJsonSchema } from 'twenty-shared/logic-function';
import { isDefined } from 'twenty-shared/utils';
import { getFunctionInputFromInputSchema } from 'twenty-shared/workflow';
import { useLogicFunctionForm } from '@/logic-functions/hooks/useLogicFunctionForm';

export const LogicFunctionTestInputInitEffect = ({
  logicFunctionId,
}: {
  logicFunctionId: string;
}) => {
  const { logicFunction } = useLogicFunctionForm({ logicFunctionId });

  const toolInputSchema = logicFunction?.toolInputSchema;

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

    if (!isDefined(toolInputSchema)) {
      return;
    }

    const schemaArray: InputJsonSchema[] = Array.isArray(toolInputSchema)
      ? toolInputSchema
      : [toolInputSchema];

    const defaultInput = getFunctionInputFromInputSchema(schemaArray)[0];

    if (!isDefined(defaultInput)) {
      return;
    }

    setLogicFunctionTestData((prev) => ({
      ...prev,
      input: defaultInput as { [field: string]: any },
      shouldInitInput: false,
    }));
  }, [
    toolInputSchema,
    logicFunctionTestData.shouldInitInput,
    setLogicFunctionTestData,
  ]);

  return null;
};
