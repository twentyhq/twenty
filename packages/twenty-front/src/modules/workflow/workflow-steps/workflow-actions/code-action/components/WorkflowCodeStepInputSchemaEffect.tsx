import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { codeStepInputSchemaFamilyState } from '@/workflow/workflow-steps/workflow-actions/code-action/states/codeStepInputSchemaFamilyState';
import { logicFunctionTestDataFamilyState } from '@/workflow/workflow-steps/workflow-actions/code-action/states/logicFunctionTestDataFamilyState';
import { useEffect } from 'react';
import {
  getInputSchemaFromSourceCode,
  jsonSchemaToInputSchema,
} from 'twenty-shared/logic-function';
import { isDefined } from 'twenty-shared/utils';
import { getFunctionInputFromInputSchema } from 'twenty-shared/workflow';

type WorkflowCodeStepInputSchemaEffectProps = {
  stepId: string;
  sourceCode: string | undefined;
};

export const WorkflowCodeStepInputSchemaEffect = ({
  stepId,
  sourceCode,
}: WorkflowCodeStepInputSchemaEffectProps) => {
  const setCodeStepInputSchema = useSetAtomFamilyState(
    codeStepInputSchemaFamilyState,
    stepId,
  );

  const setLogicFunctionTestData = useSetAtomFamilyState(
    logicFunctionTestDataFamilyState,
    stepId,
  );

  useEffect(() => {
    if (!isDefined(sourceCode)) {
      return;
    }

    let isStale = false;

    void getInputSchemaFromSourceCode(sourceCode).then((inferredJsonSchema) => {
      if (isStale) {
        return;
      }

      const inferredInputSchema = jsonSchemaToInputSchema(inferredJsonSchema);

      setCodeStepInputSchema(inferredInputSchema);

      setLogicFunctionTestData((previousTestData) => {
        if (!previousTestData.shouldInitInput) {
          return previousTestData;
        }

        return {
          ...previousTestData,
          input: getFunctionInputFromInputSchema(inferredInputSchema)[0] ?? {},
          shouldInitInput: false,
        };
      });
    });

    return () => {
      isStale = true;
    };
  }, [sourceCode, setCodeStepInputSchema, setLogicFunctionTestData]);

  return null;
};
