import { FormFieldInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputContainer';
import { FormFieldInputInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputInputContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/form-types/components/FormFieldInputRowContainer';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { WorkflowFormAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { WorkflowEditActionFormFieldSettings } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowEditActionFormFieldSettings';
import { WorkflowFormActionField } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormActionField';
import { getDefaultFormFieldSettings } from '@/workflow/workflow-steps/workflow-actions/form-action/utils/getDefaultFormFieldSettings';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useState } from 'react';
import { FieldMetadataType, isDefined } from 'twenty-shared';
import { IconChevronDown, IconPlus, IconTrash, useIcons } from 'twenty-ui';
import { useDebouncedCallback } from 'use-debounce';

import { v4 } from 'uuid';

export type WorkflowEditActionFormBuilderProps = {
  action: WorkflowFormAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowFormAction) => void;
      };
};

type FormData = WorkflowFormActionField[];

const StyledRowContainer = styled.div`
  column-gap: ${({ theme }) => theme.spacing(1)};
  display: grid;
  grid-template-columns: 1fr 16px;
`;

const StyledFieldContainer = styled.div`
  align-items: center;
  background: transparent;
  border: none;
  display: flex;
  font-family: inherit;
  padding-inline: ${({ theme }) => theme.spacing(2)};
  width: 100%;

  cursor: pointer;

  &:hover,
  &[data-open='true'] {
    background-color: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

const StyledPlaceholder = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  width: 100%;
`;

const StyledIconButtonContainer = styled.div`
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  justify-content: center;
  width: 24px;

  cursor: pointer;

  &:hover,
  &[data-open='true'] {
    background-color: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

const StyledAddFieldContainer = styled.div`
  display: flex;
  color: ${({ theme }) => theme.font.color.secondary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  justify-content: center;
  width: 100%;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

export const WorkflowEditActionFormBuilder = ({
  action,
  actionOptions,
}: WorkflowEditActionFormBuilderProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const { t } = useLingui();

  const [formData, setFormData] = useState<FormData>(action.settings.input);

  const headerTitle = isDefined(action.name) ? action.name : `Form`;
  const headerIcon = getActionIcon(action.type);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const isFieldSelected = (fieldName: string) => selectedField === fieldName;
  const handleFieldClick = (fieldName: string) => {
    if (actionOptions.readonly === true) {
      return;
    }

    if (isFieldSelected(fieldName)) {
      setSelectedField(null);
    } else {
      setSelectedField(fieldName);
    }
  };

  const onFieldUpdate = (updatedField: WorkflowFormActionField) => {
    if (actionOptions.readonly === true) {
      return;
    }

    const updatedFormData = formData.map((currentField) =>
      currentField.id === updatedField.id ? updatedField : currentField,
    );

    setFormData(updatedFormData);

    saveAction(updatedFormData);
  };

  const saveAction = useDebouncedCallback(async (formData: FormData) => {
    if (actionOptions.readonly === true) {
      return;
    }

    actionOptions.onActionUpdate({
      ...action,
      settings: {
        ...action.settings,
        input: formData,
      },
    });
  }, 1_000);

  useEffect(() => {
    return () => {
      saveAction.flush();
    };
  }, [saveAction]);

  return (
    <>
      <WorkflowStepHeader
        onTitleChange={(newName: string) => {
          if (actionOptions.readonly === true) {
            return;
          }

          actionOptions.onActionUpdate({
            ...action,
            name: newName,
          });
        }}
        Icon={getIcon(headerIcon)}
        iconColor={theme.font.color.tertiary}
        initialTitle={headerTitle}
        headerType="Action"
        disabled={actionOptions.readonly}
      />
      <WorkflowStepBody>
        {formData.map((field) => (
          <FormFieldInputContainer key={field.id}>
            {field.label ? <InputLabel>{field.label}</InputLabel> : null}

            <StyledRowContainer>
              <FormFieldInputRowContainer>
                <FormFieldInputInputContainer
                  hasRightElement={false}
                  onClick={() => {
                    handleFieldClick(field.id);
                  }}
                >
                  <StyledFieldContainer>
                    <StyledPlaceholder>{field.placeholder}</StyledPlaceholder>
                    {!isFieldSelected(field.id) && (
                      <IconChevronDown
                        size={theme.icon.size.md}
                        color={theme.font.color.tertiary}
                      />
                    )}
                  </StyledFieldContainer>
                </FormFieldInputInputContainer>
              </FormFieldInputRowContainer>
              {!actionOptions.readonly && isFieldSelected(field.id) && (
                <StyledIconButtonContainer>
                  <IconTrash
                    size={theme.icon.size.md}
                    color={theme.font.color.secondary}
                    onClick={() => {
                      const updatedFormData = formData.filter(
                        (currentField) => currentField.id !== field.id,
                      );

                      setFormData(updatedFormData);

                      actionOptions.onActionUpdate({
                        ...action,
                        settings: {
                          ...action.settings,
                          input: updatedFormData,
                        },
                      });
                    }}
                  />
                </StyledIconButtonContainer>
              )}
              {isFieldSelected(field.id) && (
                <WorkflowEditActionFormFieldSettings
                  field={field}
                  onChange={onFieldUpdate}
                  onClose={() => {
                    setSelectedField(null);
                  }}
                />
              )}
            </StyledRowContainer>
          </FormFieldInputContainer>
        ))}
        {!actionOptions.readonly && (
          <StyledRowContainer>
            <FormFieldInputContainer>
              <FormFieldInputRowContainer>
                <FormFieldInputInputContainer
                  hasRightElement={false}
                  onClick={() => {
                    const { label, placeholder, name } =
                      getDefaultFormFieldSettings(FieldMetadataType.TEXT);

                    const newField: WorkflowFormActionField = {
                      id: v4(),
                      name,
                      type: FieldMetadataType.TEXT,
                      label,
                      placeholder,
                    };

                    setFormData([...formData, newField]);

                    actionOptions.onActionUpdate({
                      ...action,
                      settings: {
                        ...action.settings,
                        input: [...action.settings.input, newField],
                      },
                    });
                  }}
                >
                  <StyledFieldContainer>
                    <StyledAddFieldContainer>
                      <IconPlus size={theme.icon.size.sm} />
                      {t`Add Field`}
                    </StyledAddFieldContainer>
                  </StyledFieldContainer>
                </FormFieldInputInputContainer>
              </FormFieldInputRowContainer>
            </FormFieldInputContainer>
          </StyledRowContainer>
        )}
      </WorkflowStepBody>
    </>
  );
};
