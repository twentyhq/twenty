import { type WorkflowHttpRequestAction } from '@/workflow/types/Workflow';
import { parseAndValidateVariableFriendlyStringifiedJson } from '@/workflow/utils/parseAndValidateVariableFriendlyStringifiedJson';
import { convertOutputSchemaToJson } from '@/workflow/workflow-steps/workflow-actions/http-request-action/utils/convertOutputSchemaToJson';
import { getHttpRequestOutputSchema } from '@/workflow/workflow-steps/workflow-actions/http-request-action/utils/getHttpRequestOutputSchema';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type BaseOutputSchemaV2 } from 'twenty-shared/workflow';

type UseHttpRequestOutputSchemaProps = {
  action: WorkflowHttpRequestAction;
  onActionUpdate?: (action: WorkflowHttpRequestAction) => void;
  readonly?: boolean;
};

const getInitialExpectedBody = (
  action: WorkflowHttpRequestAction,
): object | undefined => {
  const expectedOutputSchema = action.settings.expectedOutputSchema;

  if (
    isDefined(expectedOutputSchema) &&
    Object.keys(expectedOutputSchema).length
  ) {
    return expectedOutputSchema;
  }

  if (Object.keys(action.settings.outputSchema).length) {
    return convertOutputSchemaToJson(
      action.settings.outputSchema as BaseOutputSchemaV2,
    );
  }

  return undefined;
};

export const useHttpRequestOutputSchema = ({
  action,
  onActionUpdate,
  readonly,
}: UseHttpRequestOutputSchemaProps) => {
  const initialExpectedBody = getInitialExpectedBody(action);

  const [outputSchema, setOutputSchema] = useState<string | null>(
    isDefined(initialExpectedBody)
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
        outputSchema: getHttpRequestOutputSchema(parsingResult.data),
      },
    });
  };

  return {
    outputSchema,
    handleOutputSchemaChange,
    error,
  };
};
