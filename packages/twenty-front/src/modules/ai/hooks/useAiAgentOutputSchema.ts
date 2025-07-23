import { WorkflowAiAgentAction } from '@/workflow/types/Workflow';
import { OutputSchemaField } from '@/ai/constants/output-field-type-options';
import { BaseOutputSchema } from '@/workflow/workflow-variables/types/StepOutputSchema';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';
import { v4 } from 'uuid';
import { getFieldIcon } from '../utils/getFieldIcon';

export const useAiAgentOutputSchema = (
  outputSchema?: BaseOutputSchema,
  onActionUpdate?: (action: WorkflowAiAgentAction) => void,
  action?: WorkflowAiAgentAction,
  readonly?: boolean,
) => {
  const [outputFields, setOutputFields] = useState<OutputSchemaField[]>(
    Object.entries(outputSchema || {}).map(([name, field]) => ({
      id: v4(),
      name,
      type: field.type,
      description: field.description,
    })),
  );

  const debouncedSave = useDebouncedCallback(
    async (fields: OutputSchemaField[]) => {
      if (readonly === true) {
        return;
      }

      const newOutputSchema = fields.reduce<BaseOutputSchema>(
        (schema, field) => {
          if (isDefined(field.name)) {
            schema[field.name] = {
              isLeaf: true,
              type: field.type,
              value: null,
              icon: getFieldIcon(field.type),
              label: field.name,
              description: field.description,
            };
          }
          return schema;
        },
        {},
      );

      if (isDefined(onActionUpdate) && isDefined(action)) {
        onActionUpdate({
          ...action,
          settings: {
            ...action.settings,
            outputSchema: newOutputSchema,
          },
        });
      }
    },
    500,
  );

  const handleOutputSchemaChange = async (fields: OutputSchemaField[]) => {
    setOutputFields(fields);
    await debouncedSave(fields);
  };

  return {
    handleOutputSchemaChange,
    outputFields,
  };
};
