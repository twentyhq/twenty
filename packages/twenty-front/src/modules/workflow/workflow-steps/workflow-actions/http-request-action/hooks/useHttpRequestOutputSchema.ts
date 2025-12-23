import { type WorkflowHttpRequestAction } from '@/workflow/types/Workflow';
import { parseAndValidateVariableFriendlyStringifiedJson } from '@/workflow/utils/parseAndValidateVariableFriendlyStringifiedJson';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { type BaseOutputSchemaV2 } from 'twenty-shared/workflow';
import { convertOutputSchemaToJson } from '@/workflow/workflow-steps/workflow-actions/http-request-action/utils/convertOutputSchemaToJson';
import { getHttpRequestOutputSchema } from '@/workflow/workflow-steps/workflow-actions/http-request-action/utils/getHttpRequestOutputSchema';

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
  const [outputSchema, setOutputSchema] = useState<string | null>(
    Object.keys(action.settings.outputSchema).length
      ? JSON.stringify(
          convertOutputSchemaToJson(
            action.settings.outputSchema as BaseOutputSchemaV2,
          ),
          null,
          2,
        )
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
