import { AgentOutputSchemaBuilder } from '@/ai/components/AgentOutputSchemaBuilder';
import { type OutputSchemaField } from '@/ai/types/OutputSchemaField';
import { createDefaultOutputSchemaField } from '@/ai/utils/createDefaultOutputSchemaField';
import { fieldsToSchema } from '@/ai/utils/fieldsToSchema';
import { schemaToFields } from '@/ai/utils/schemaToFields';
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
