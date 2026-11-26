import { AgentOutputSchemaBuilder } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/AgentOutputSchemaBuilder';
import { type OutputSchemaField } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/types/OutputSchemaField';
import { createDefaultOutputSchemaField } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/createDefaultOutputSchemaField';
import { fieldsToSchema } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/fieldsToSchema';
import { schemaToFields } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/schemaToFields';
import { useState } from 'react';
import { type AgentResponseFormat } from 'twenty-shared/ai';

type WorkflowAiAgentOutputFormatFieldProps = {
  responseFormat: AgentResponseFormat | null | undefined;
  readonly: boolean;
  onResponseFormatChange: (responseFormat: AgentResponseFormat) => void;
};

export const WorkflowAiAgentOutputFormatField = ({
  responseFormat,
  readonly,
  onResponseFormatChange,
}: WorkflowAiAgentOutputFormatFieldProps) => {
  const [outputSchemaFields, setOutputSchemaFields] = useState<
    OutputSchemaField[]
  >(() => {
    const existingFields =
      responseFormat?.type === 'json'
        ? schemaToFields(responseFormat.schema)
        : [];

    return existingFields.length > 0
      ? existingFields
      : [createDefaultOutputSchemaField()];
  });

  const handleOutputSchemaChange = (updatedFields: OutputSchemaField[]) => {
    setOutputSchemaFields(updatedFields);
    onResponseFormatChange({
      type: 'json',
      schema: fieldsToSchema(updatedFields),
    });
  };

  return (
    <AgentOutputSchemaBuilder
      fields={outputSchemaFields}
      onChange={handleOutputSchemaChange}
      readonly={readonly}
    />
  );
};
