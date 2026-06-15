import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';

import { type OutputSchemaField } from '@/ai/constants/OutputFieldTypeOptions';
import { createDefaultOutputSchemaField } from '@/ai/utils/createDefaultOutputSchemaField';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext, useState } from 'react';
import {
  IconChevronDown,
  IconPlus,
  IconVariable,
  IconX,
} from 'twenty-ui/display';
import { AnimatedLightIconButton, LightIconButton } from 'twenty-ui/input';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';
import { MenuItem } from 'twenty-ui/navigation';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
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

const StyledSettingsHeader = styled.div<{
  showRemoveFieldButton: boolean;
  isExpanded: boolean;
}>`
  align-items: center;
  border-bottom: ${({ isExpanded }) =>
    isExpanded ? `1px solid ${themeCssVariables.border.color.medium}` : 'none'};
  cursor: pointer;
  display: grid;
  gap: ${themeCssVariables.spacing[1]};
  grid-template-columns: ${({ showRemoveFieldButton }) =>
    showRemoveFieldButton
      ? `1fr ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[6]}`
      : `1fr ${themeCssVariables.spacing[6]}`};
  height: ${themeCssVariables.spacing[8]};
  padding-left: ${themeCssVariables.spacing[2]};
  padding-right: ${themeCssVariables.spacing[1]};
`;

const StyledTitleContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[1]};
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

export const WorkflowOutputSchemaBuilder = ({
  fields,
  onChange,
  readonly,
}: WorkflowOutputSchemaBuilderProps) => {
  const { theme } = useContext(ThemeContext);
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

  return (
    <StyledOutputSchemaContainer>
      <InputLabel>{t`Output`}</InputLabel>

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
          {fields.map((field) => {
            const isExpanded = expandedFieldIds.has(field.id);

            return (
              <StyledOutputSchemaFieldContainer key={field.id}>
                <StyledSettingsHeader
                  showRemoveFieldButton={showRemoveFieldButton}
                  onClick={() => toggleField(field.id)}
                  isExpanded={isExpanded}
                >
                  <StyledTitleContainer>
                    <IconVariable size={theme.icon.size.sm} />
                    <span>{field.name || t`Untitled field`}</span>
                  </StyledTitleContainer>
                  <AnimatedLightIconButton
                    Icon={IconChevronDown}
                    size="small"
                    animate={{ rotate: isExpanded ? -180 : 0 }}
                  />
                  {showRemoveFieldButton && (
                    <LightIconButton
                      testId="remove-output-field-button"
                      Icon={IconX}
                      size="small"
                      onClick={() => {
                        removeField(field.id);
                      }}
                    />
                  )}
                </StyledSettingsHeader>
                <AnimatedExpandableContainer
                  isExpanded={isExpanded}
                  initial={false}
                  mode="fit-content"
                >
                  <StyledSettingsContent>
                    <FormFieldInputContainer>
                      <FormTextFieldInput
                        label={t`Variable Name`}
                        placeholder={t`e.g., summary, status, count`}
                        defaultValue={field.name}
                        onChange={(value) =>
                          updateField(field.id, { name: value.trim() })
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
                </AnimatedExpandableContainer>
              </StyledOutputSchemaFieldContainer>
            );
          })}
        </StyledFieldsContainer>
      )}

      {!readonly && (
        <StyledAddFieldButtonContainer>
          <MenuItem
            LeftIcon={IconPlus}
            text={t`Add Output Field`}
            onClick={addField}
          />
        </StyledAddFieldButtonContainer>
      )}
    </StyledOutputSchemaContainer>
  );
};
