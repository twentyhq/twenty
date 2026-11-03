import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { logicFunctionTestDataFamilyState } from '@/workflow/workflow-steps/workflow-actions/code-action/states/logicFunctionTestDataFamilyState';
import { useEffect, useState } from 'react';
import {
  getInputSchemaFromSourceCode,
  jsonSchemaToInputSchema,
} from 'twenty-shared/logic-function';
import { isDefined } from 'twenty-shared/utils';
import {
  getFunctionInputFromInputSchema,
  type InputSchema,
} from 'twenty-shared/workflow';

export const useCodeStepInputSchema = ({
  stepId,
  sourceCode,
}: {
  stepId: string;
  sourceCode: string | undefined;
}) => {
  const [inputSchema, setInputSchema] = useState<InputSchema>();

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

      setInputSchema(inferredInputSchema);

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
  }, [sourceCode, setLogicFunctionTestData]);

  return { inputSchema };
};
