import { WorkflowHttpRequestAction } from '@/workflow/types/Workflow';
import { BaseOutputSchema } from '@/workflow/workflow-variables/types/StepOutputSchema';
import { useState } from 'react';
import { convertOutputSchemaToJson } from '../utils/convertOutputSchemaToJson';
import { getHttpRequestOutputSchema } from '../utils/getHttpRequestOutputSchema';

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
            action.settings.outputSchema as BaseOutputSchema,
          ),
          null,
          2,
        )
      : null,
  );

  const [error, setError] = useState<string | undefined>();

  const handleOutputSchemaChange = (value: string | null) => {
    if (value === null || value === '' || readonly === true) {
      setError(undefined);
      return;
    }

    setOutputSchema(value);

    try {
      const parsedJson = JSON.parse(value);
      const outputSchema = getHttpRequestOutputSchema(parsedJson);
      onActionUpdate?.({
        ...action,
        settings: {
          ...action.settings,
          outputSchema,
        },
      });
      setError(undefined);
    } catch (error) {
      setError(String(error));
    }
  };

  return {
    outputSchema,
    handleOutputSchemaChange,
    error,
  };
};
