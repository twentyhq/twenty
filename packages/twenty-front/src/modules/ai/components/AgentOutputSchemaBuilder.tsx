import { type OutputSchemaField } from '@/ai/types/OutputSchemaField';
import { createDefaultOutputSchemaField } from '@/ai/utils/createDefaultOutputSchemaField';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { InputLabel } from '@/ui/input/components/internal/InputLabel/InputLabel';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { isValidAgentResponseSchemaPropertyKey } from 'twenty-shared/ai';
import { IconPlus } from 'twenty-ui/icon';
import { Collapsible } from 'twenty-ui/primitives/layout';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { themeCssVariables } from 'twenty-ui/theme';
import { AgentOutputFieldTypeSelector } from '@/ai/components/AgentOutputFieldTypeSelector';
import { AgentOutputSchemaFieldHeader } from '@/ai/components/AgentOutputSchemaFieldHeader';
type AgentOutputSchemaBuilderProps = {
  fields: OutputSchemaField[];
  onChange: (fields: OutputSchemaField[]) => void;
  readonly?: boolean;
};

const StyledOutputSchemaContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledFieldsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledOutputSchemaFieldContainer = styled.div`
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledSettingsContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding-bottom: ${themeCssVariables.spacing[3]};
  padding-inline: ${themeCssVariables.spacing[3]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledAddFieldButtonContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[2]};
`;

const StyledMessageContentContainer = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  line-height: normal;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledMessageDescription = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-weight: ${themeCssVariables.font.weight.regular};
`;

export const AgentOutputSchemaBuilder = ({
  fields,
  onChange,
  readonly,
}: AgentOutputSchemaBuilderProps) => {
  const [expandedFieldIds, setExpandedFieldIds] = useState<Set<string>>(
    () => new Set(fields.map((field) => field.id)),
  );

  const toggleField = (id: string) => {
    setExpandedFieldIds((previousExpandedFieldIds) => {
      const nextExpandedFieldIds = new Set(previousExpandedFieldIds);

      if (nextExpandedFieldIds.has(id)) {
        nextExpandedFieldIds.delete(id);
      } else {
        nextExpandedFieldIds.add(id);
      }

      return nextExpandedFieldIds;
    });
  };

  const addField = () => {
    const newField = createDefaultOutputSchemaField();

    setExpandedFieldIds(
      (previousExpandedFieldIds) =>
        new Set([...previousExpandedFieldIds, newField.id]),
    );

    onChange([...fields, newField]);
  };

  const removeField = (id: string) => {
    setExpandedFieldIds((previousExpandedFieldIds) => {
      const nextExpandedFieldIds = new Set(previousExpandedFieldIds);
      nextExpandedFieldIds.delete(id);
      return nextExpandedFieldIds;
    });

    onChange(fields.filter((field) => field.id !== id));
  };

  const showRemoveFieldButton = !readonly && fields.length > 1;

  const updateField = (id: string, updates: Partial<OutputSchemaField>) => {
    onChange(
      fields.map((field) =>
        field.id === id ? { ...field, ...updates } : field,
      ),
    );
  };

  const getVariableNameError = (name: string): string | undefined => {
    if (
      !isNonEmptyString(name) ||
      isValidAgentResponseSchemaPropertyKey(name)
    ) {
      return undefined;
    }

    return t`Use only letters, numbers, underscores, dots or hyphens (max 64 characters).`;
  };

  return (
    <StyledOutputSchemaContainer>
      <InputLabel>{t`Output`}</InputLabel>

      {fields.length === 0 && (
        <StyledOutputSchemaFieldContainer>
          <StyledMessageContentContainer>
            <StyledMessageDescription data-testid="empty-output-schema-message-description">
              {t`Click on "Add Output Field" below to define the structure of your agent's response. These fields will be used to format and validate the agent's output when the workflow is executed, and can be referenced by subsequent workflow steps.`}
            </StyledMessageDescription>
          </StyledMessageContentContainer>
        </StyledOutputSchemaFieldContainer>
      )}

      {fields.length > 0 && (
        <StyledFieldsContainer>
          {fields.map((field) => {
            const isExpanded = expandedFieldIds.has(field.id);

            return (
              <StyledOutputSchemaFieldContainer key={field.id}>
                <AgentOutputSchemaFieldHeader
                  name={field.name}
                  isExpanded={isExpanded}
                  onToggle={() => toggleField(field.id)}
                  onRemove={
                    showRemoveFieldButton
                      ? () => removeField(field.id)
                      : undefined
                  }
                />
                <Collapsible isExpanded={isExpanded}>
                  <StyledSettingsContent>
                    <FormFieldInputContainer>
                      <FormTextFieldInput
                        label={t`Variable Name`}
                        placeholder={t`e.g., summary, status, count`}
                        defaultValue={field.name}
                        error={getVariableNameError(field.name)}
                        onChange={(value) =>
                          updateField(field.id, { name: value.trim() })
                        }
                        readonly={readonly}
                      />
                    </FormFieldInputContainer>

                    <FormFieldInputContainer>
                      <AgentOutputFieldTypeSelector
                        onChange={(value) =>
                          updateField(field.id, { type: value })
                        }
                        value={field.type}
                        disabled={readonly}
                        dropdownId={`output-field-type-selector-${field.id}`}
                      />
                    </FormFieldInputContainer>

                    <FormFieldInputContainer>
                      <FormTextFieldInput
                        label={t`Instruction for AI`}
                        placeholder={t`Brief explanation of this output field`}
                        defaultValue={field.description}
                        onChange={(value) =>
                          updateField(field.id, { description: value })
                        }
                        readonly={readonly}
                      />
                    </FormFieldInputContainer>
                  </StyledSettingsContent>
                </Collapsible>
              </StyledOutputSchemaFieldContainer>
            );
          })}
        </StyledFieldsContainer>
      )}

      {!readonly && (
        <StyledAddFieldButtonContainer>
          <ListItem
            startIcon={<IconPlus />}
            onClick={addField}
          >{t`Add Output Field`}</ListItem>
        </StyledAddFieldButtonContainer>
      )}
    </StyledOutputSchemaContainer>
  );
};
