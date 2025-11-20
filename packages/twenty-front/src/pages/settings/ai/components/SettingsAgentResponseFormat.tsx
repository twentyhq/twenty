import { type OutputSchemaField } from '@/ai/constants/OutputFieldTypeOptions';
import { Select } from '@/ui/input/components/Select';
import { WorkflowOutputSchemaBuilder } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowOutputSchemaBuilder';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import {
  type AgentResponseFieldType,
  type AgentResponseSchema,
} from 'twenty-shared/ai';
import { v4 } from 'uuid';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

type SettingsAgentResponseFormatProps = {
  responseFormat?: {
    type: 'text' | 'json';
    schema?: AgentResponseSchema;
  };
  onResponseFormatChange: (format: {
    type: 'text' | 'json';
    schema?: AgentResponseSchema;
  }) => void;
  disabled?: boolean;
};

const schemaToFields = (schema: AgentResponseSchema): OutputSchemaField[] => {
  if (!schema.properties) return [];

  return Object.entries(schema.properties).map(([key, field]) => ({
    id: v4(),
    name: key,
    description: field.description || '',
    type: field.type,
  }));
};

const fieldsToSchema = (fields: OutputSchemaField[]): AgentResponseSchema => {
  const properties: Record<
    string,
    { type: AgentResponseFieldType; description?: string }
  > = {};
  const required: string[] = [];

  fields
    .filter((field) => field.name.trim() && field.type)
    .forEach((field) => {
      properties[field.name] = {
        type: field.type!,
        description: field.description || field.name,
      };
      required.push(field.name);
    });

  return {
    type: 'object' as const,
    properties,
    required,
    additionalProperties: false as const,
  };
};

export const SettingsAgentResponseFormat = ({
  responseFormat,
  onResponseFormatChange,
  disabled,
}: SettingsAgentResponseFormatProps) => {
  const formatType = responseFormat?.type || 'text';
  const schema: AgentResponseSchema = responseFormat?.schema || {
    type: 'object' as const,
    properties: {},
    required: [],
    additionalProperties: false as const,
  };

  const [visualBuilderFields, setVisualBuilderFields] = useState<
    OutputSchemaField[]
  >(() => schemaToFields(schema));

  const handleFormatTypeChange = (newType: 'text' | 'json') => {
    if (newType === 'json') {
      setVisualBuilderFields(schemaToFields(schema));
    }
    const emptySchema: AgentResponseSchema = {
      type: 'object' as const,
      properties: {},
      required: [],
      additionalProperties: false as const,
    };
    onResponseFormatChange({
      type: newType,
      schema: newType === 'text' ? emptySchema : schema,
    });
  };

  const handleVisualBuilderChange = (updatedFields: OutputSchemaField[]) => {
    setVisualBuilderFields(updatedFields);
    onResponseFormatChange({
      type: 'json',
      schema: fieldsToSchema(updatedFields),
    });
  };

  return (
    <StyledContainer>
      <Select
        dropdownId="agent-response-format-type"
        label={t`Response Format`}
        value={formatType}
        onChange={handleFormatTypeChange}
        options={[
          { label: t`String`, value: 'text' as const },
          { label: t`JSON`, value: 'json' as const },
        ]}
        disabled={disabled}
      />

      {formatType === 'json' && (
        <WorkflowOutputSchemaBuilder
          fields={visualBuilderFields}
          onChange={handleVisualBuilderChange}
          readonly={disabled}
        />
      )}
    </StyledContainer>
  );
};
