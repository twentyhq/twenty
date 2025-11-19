import { type OutputSchemaField } from '@/ai/constants/OutputFieldTypeOptions';
import { Select } from '@/ui/input/components/Select';
import { type InputSchemaPropertyType } from '@/workflow/types/InputSchema';
import { WorkflowOutputSchemaBuilder } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowOutputSchemaBuilder';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { type BaseOutputSchemaV2 } from 'twenty-shared/workflow';
import { v4 } from 'uuid';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

type SettingsAgentResponseFormatProps = {
  responseFormat?: {
    type: 'text' | 'json';
    schema?: BaseOutputSchemaV2;
  };
  onResponseFormatChange: (format: {
    type: 'text' | 'json';
    schema?: BaseOutputSchemaV2;
  }) => void;
  disabled?: boolean;
};

// Convert BaseOutputSchemaV2 to OutputSchemaField[] for visual builder
const schemaToFields = (schema: BaseOutputSchemaV2): OutputSchemaField[] => {
  return Object.entries(schema).map(
    ([key, value]): OutputSchemaField => ({
      id: v4(),
      name: key,
      description: value.label || '',
      type: value.type as InputSchemaPropertyType | undefined,
    }),
  );
};

// Convert OutputSchemaField[] to BaseOutputSchemaV2 for storage
const fieldsToSchema = (fields: OutputSchemaField[]): BaseOutputSchemaV2 => {
  const schema: BaseOutputSchemaV2 = {};
  fields.forEach((field) => {
    if (field.name.trim() !== '') {
      schema[field.name] = {
        isLeaf: true,
        type: (field.type as any) || 'string',
        value: null,
        label: field.description || field.name,
      };
    }
  });
  return schema;
};

export const SettingsAgentResponseFormat = ({
  responseFormat,
  onResponseFormatChange,
  disabled,
}: SettingsAgentResponseFormatProps) => {
  const formatType = responseFormat?.type || 'text';
  const schema = responseFormat?.schema || {};

  // Local state for visual builder to allow empty fields to persist in UI
  const [visualBuilderFields, setVisualBuilderFields] = useState<
    OutputSchemaField[]
  >(() => schemaToFields(schema));

  const handleFormatTypeChange = (newType: 'text' | 'json') => {
    const newSchema = newType === 'text' ? {} : schema;
    if (newType === 'json') {
      setVisualBuilderFields(schemaToFields(newSchema));
    }
    onResponseFormatChange({
      type: newType,
      schema: newSchema,
    });
  };

  const handleVisualBuilderChange = (updatedFields: OutputSchemaField[]) => {
    // Update local state immediately for responsive UI
    setVisualBuilderFields(updatedFields);

    // Update parent state with schema (filtering out empty fields)
    onResponseFormatChange({
      type: 'json',
      schema: fieldsToSchema(updatedFields),
    });
  };

  const formatTypeOptions = [
    { label: t`String`, value: 'text' as const },
    { label: t`JSON`, value: 'json' as const },
  ];

  return (
    <StyledContainer>
      <Select
        dropdownId="agent-response-format-type"
        label={t`Response Format`}
        value={formatType}
        onChange={handleFormatTypeChange}
        options={formatTypeOptions}
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
