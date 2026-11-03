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

  // The schema is inferred asynchronously from the saved source, so a stale inference must not win
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

      setLogicFunctionTestData((previousTestData) =>
        previousTestData.shouldInitInput
          ? {
              ...previousTestData,
              input:
                getFunctionInputFromInputSchema(inferredInputSchema)[0] ?? {},
              shouldInitInput: false,
            }
          : previousTestData,
      );
    });

    return () => {
      isStale = true;
    };
  }, [sourceCode, setLogicFunctionTestData]);

  return { inputSchema };
};
