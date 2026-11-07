import { type WorkflowHttpRequestAction } from '@/workflow/types/Workflow';
import { parseAndValidateVariableFriendlyStringifiedJson } from '~/utils/parseAndValidateVariableFriendlyStringifiedJson';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined, isEmptyObject } from 'twenty-shared/utils';

type UseHttpRequestOutputSchemaProps = {
  action: WorkflowHttpRequestAction;
  onActionUpdate?: (action: WorkflowHttpRequestAction) => void;
  readonly?: boolean;
};

export const useHttpRequestOutputSchema = ({
  action,
  onActionUpdate,
  readonly,
}: UseHttpRequestOutputSchemaProps) => {
  const initialExpectedBody = action.settings.expectedOutputSchema;

  const [outputSchema, setOutputSchema] = useState<string | null>(
    isDefined(initialExpectedBody) && !isEmptyObject(initialExpectedBody)
      ? JSON.stringify(initialExpectedBody, null, 2)
      : null,
  );

  const [error, setError] = useState<string | undefined>();

  const handleOutputSchemaChange = (value: string | null) => {
    if (readonly === true) {
      return;
    }

    setOutputSchema(value);

    const parsingResult = parseAndValidateVariableFriendlyStringifiedJson(
      isNonEmptyString(value) ? value : '{}',
    );

    if (!parsingResult.isValid) {
      setError(parsingResult.error);
      return;
    }

    setError(undefined);
    onActionUpdate?.({
      ...action,
      settings: {
        ...action.settings,
        expectedOutputSchema: parsingResult.data,
        outputSchema: {},
      },
    });
  };

  return {
    outputSchema,
    handleOutputSchemaChange,
    error,
  };
};
