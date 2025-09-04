import { type OutputSchemaField } from '@/ai/constants/OutputFieldTypeOptions';
import { type WorkflowAiAgentAction } from '@/workflow/types/Workflow';
import { type BaseOutputSchemaDeprecated } from '@/workflow/workflow-variables/types/BaseOutputSchemaV2';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';
import { v4 } from 'uuid';

export const useAiAgentOutputSchema = (
  outputSchema?: BaseOutputSchemaDeprecated,
  onActionUpdate?: (action: WorkflowAiAgentAction) => void,
  action?: WorkflowAiAgentAction,
  readonly?: boolean,
) => {
  const [outputFields, setOutputFields] = useState<OutputSchemaField[]>(
    Object.entries(outputSchema || {}).map(([name, field]) => ({
      id: v4(),
      name,
      type: field.type,
    })),
  );

  const debouncedSave = useDebouncedCallback(
    async (fields: OutputSchemaField[]) => {
      if (readonly === true) {
        return;
      }

      const newOutputSchema = fields.reduce<BaseOutputSchemaDeprecated>(
        (schema, field) => {
          if (isDefined(field.name)) {
            schema[field.name] = {
              isLeaf: true,
              type: field.type,
              value: null,
              label: field.name,
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
