import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';

import { type OutputSchemaField } from '@/ai/constants/OutputFieldTypeOptions';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { IconPlus, IconTrash } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { v4 } from 'uuid';
import { WorkflowOutputFieldTypeSelector } from './WorkflowOutputFieldTypeSelector';

type WorkflowOutputSchemaBuilderProps = {
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
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledOutputSchemaFieldContainer = styled.div`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledSettingsContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledSettingsHeader = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: grid;
  gap: ${({ theme }) => theme.spacing(1)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(3)};
  grid-template-columns: 1fr 24px;
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledTitleContainer = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
  padding-top: ${({ theme }) => theme.spacing(3)};
`;

const StyledCloseButtonContainer = styled.div`
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledAddFieldButton = styled.button`
  align-items: center;
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  font-family: inherit;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  width: 100%;
  background-color: ${({ theme }) => theme.background.transparent.lighter};

  &:hover {
    background-color: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledMessageContentContainer = styled.div`
  flex-direction: column;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(4)};
  line-height: normal;
`;

const StyledMessageDescription = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-weight: ${({ theme }) => theme.font.weight.regular};
`;

export const WorkflowOutputSchemaBuilder = ({
  fields,
  onChange,
  readonly,
}: WorkflowOutputSchemaBuilderProps) => {
  const theme = useTheme();

  const addField = () => {
    const newField: OutputSchemaField = {
      id: v4(),
      name: '',
      description: '',
      type: 'string',
    };
    onChange([...fields, newField]);
  };

  const removeField = (id: string) => {
    onChange(fields.filter((field) => field.id !== id));
  };

  const updateField = (id: string, updates: Partial<OutputSchemaField>) => {
    onChange(
      fields.map((field) =>
        field.id === id ? { ...field, ...updates } : field,
      ),
    );
  };

  return (
    <StyledOutputSchemaContainer>
      <InputLabel>{t`AI Response Schema`}</InputLabel>

      {fields.length === 0 && (
        <StyledOutputSchemaFieldContainer>
          <StyledMessageContentContainer>
            <StyledMessageDescription data-testid="empty-output-schema-message-description">
              {t`Click on "Add Output Field" below to define the structure of your AI agent's response. These fields will be used to format and validate the AI's output when the workflow is executed, and can be referenced by subsequent workflow steps.`}
            </StyledMessageDescription>
          </StyledMessageContentContainer>
        </StyledOutputSchemaFieldContainer>
      )}

      {fields.length > 0 && (
        <StyledFieldsContainer>
          {fields.map((field, index) => {
            const fieldNumber = index + 1;

            return (
              <StyledOutputSchemaFieldContainer key={field.id}>
                <StyledSettingsHeader>
                  <StyledTitleContainer>
                    <span>{t`Output Field ${fieldNumber}`}</span>
                  </StyledTitleContainer>
                  <StyledCloseButtonContainer>
                    {!readonly && (
                      <LightIconButton
                        testId="close-button"
                        Icon={IconTrash}
                        size="small"
                        accent="secondary"
                        onClick={() => removeField(field.id)}
                      />
                    )}
                  </StyledCloseButtonContainer>
                </StyledSettingsHeader>
                <StyledSettingsContent>
                  <FormFieldInputContainer>
                    <FormTextFieldInput
                      label={t`Field Name`}
                      placeholder={t`e.g., summary, status, count`}
                      defaultValue={field.name}
                      onChange={(value) =>
                        updateField(field.id, { name: value })
                      }
                      readonly={readonly}
                    />
                  </FormFieldInputContainer>

                  <FormFieldInputContainer>
                    <WorkflowOutputFieldTypeSelector
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
                      label={t`Description`}
                      placeholder={t`Brief explanation of this output field`}
                      defaultValue={field.description}
                      onChange={(value) =>
                        updateField(field.id, { description: value })
                      }
                      readonly={readonly}
                    />
                  </FormFieldInputContainer>
                </StyledSettingsContent>
              </StyledOutputSchemaFieldContainer>
            );
          })}
        </StyledFieldsContainer>
      )}

      {!readonly && (
        <StyledAddFieldButton onClick={addField}>
          <IconPlus size={theme.icon.size.sm} />
          {t`Add Output Field`}
        </StyledAddFieldButton>
      )}
    </StyledOutputSchemaContainer>
  );
};
