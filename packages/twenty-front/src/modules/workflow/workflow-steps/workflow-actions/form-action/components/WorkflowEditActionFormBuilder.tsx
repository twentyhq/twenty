import { FormFieldInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/form-types/components/FormFieldInputRowContainer';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { WorkflowFormAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { WorkflowEditActionFormFieldSettings } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowEditActionFormFieldSettings';
import { WorkflowFormActionField } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormActionField';
import { getDefaultFormFieldSettings } from '@/workflow/workflow-steps/workflow-actions/form-action/utils/getDefaultFormFieldSettings';
import { useActionHeaderTypeOrThrow } from '@/workflow/workflow-steps/workflow-actions/hooks/useActionHeaderTypeOrThrow';
import { useActionIconColorOrThrow } from '@/workflow/workflow-steps/workflow-actions/hooks/useActionIconColorOrThrow';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  IconChevronDown,
  IconGripVertical,
  IconPlus,
  IconTrash,
  useIcons,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
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

const StyledWorkflowStepBody = styled(WorkflowStepBody)`
  padding-inline: ${({ theme }) => theme.spacing(2)};
`;

const StyledFormFieldContainer = styled.div`
  align-items: flex-end;
  column-gap: ${({ theme }) => theme.spacing(1)};
  display: grid;
  grid-template-areas:
    'grip input delete'
    '. settings .';
  grid-template-columns: 24px 1fr 24px;
`;

const StyledLightGripIconButton = styled(LightIconButton)`
  grid-area: grip;
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledLightTrashIconButton = styled(LightIconButton)`
  grid-area: delete;
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledLabelAndFieldContainer = styled.div`
  grid-area: input;
`;

const StyledOpenedSettingsContainer = styled.div`
  grid-area: settings;
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

const StyledAddFieldButtonContainer = styled.div`
  padding-inline: ${({ theme }) => theme.spacing(7)};
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledAddFieldButtonContentContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(0.5)};
  justify-content: center;
  width: 100%;
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
  const headerIconColor = useActionIconColorOrThrow(action.type);
  const headerType = useActionHeaderTypeOrThrow(action.type);

  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const isFieldSelected = (fieldName: string) => selectedField === fieldName;
  const isFieldHovered = (fieldName: string) => hoveredField === fieldName;
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
        iconColor={headerIconColor}
        initialTitle={headerTitle}
        headerType={headerType}
        disabled={actionOptions.readonly}
      />
      <StyledWorkflowStepBody>
        {formData.map((field) => (
          <StyledFormFieldContainer
            key={field.id}
            onMouseEnter={() => setHoveredField(field.id)}
            onMouseLeave={() => setHoveredField(null)}
          >
            {!actionOptions.readonly &&
              (isFieldSelected(field.id) || isFieldHovered(field.id)) && (
                <StyledLightGripIconButton Icon={IconGripVertical} />
              )}

            <StyledLabelAndFieldContainer>
              <InputLabel>{field.label || ''}</InputLabel>

              <FormFieldInputRowContainer>
                <FormFieldInputInnerContainer
                  hasRightElement={false}
                  onClick={() => {
                    handleFieldClick(field.id);
                  }}
                >
                  <StyledFieldContainer>
                    <StyledPlaceholder>
                      {isDefined(field.placeholder) &&
                      isNonEmptyString(field.placeholder)
                        ? field.placeholder
                        : getDefaultFormFieldSettings(field.type).placeholder}
                    </StyledPlaceholder>
                    {field.type === 'RECORD' && (
                      <IconChevronDown
                        size={theme.icon.size.md}
                        color={theme.font.color.tertiary}
                      />
                    )}
                  </StyledFieldContainer>
                </FormFieldInputInnerContainer>
              </FormFieldInputRowContainer>
            </StyledLabelAndFieldContainer>

            {!actionOptions.readonly &&
              (isFieldSelected(field.id) || isFieldHovered(field.id)) && (
                <StyledLightTrashIconButton
                  Icon={IconTrash}
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
              )}

            {isFieldSelected(field.id) && (
              <StyledOpenedSettingsContainer>
                <WorkflowEditActionFormFieldSettings
                  field={field}
                  onChange={onFieldUpdate}
                  onClose={() => {
                    setSelectedField(null);
                  }}
                />
              </StyledOpenedSettingsContainer>
            )}
          </StyledFormFieldContainer>
        ))}

        {!actionOptions.readonly && (
          <StyledAddFieldButtonContainer>
            <FormFieldInputContainer>
              <FormFieldInputRowContainer>
                <FormFieldInputInnerContainer
                  hasRightElement={false}
                  onClick={() => {
                    const { label, name } = getDefaultFormFieldSettings(
                      FieldMetadataType.TEXT,
                    );

                    const newField: WorkflowFormActionField = {
                      id: v4(),
                      name,
                      type: FieldMetadataType.TEXT,
                      label,
                    };

                    setFormData([...formData, newField]);

                    actionOptions.onActionUpdate({
                      ...action,
                      settings: {
                        ...action.settings,
                        input: [...action.settings.input, newField],
                      },
                    });

                    setSelectedField(newField.id);
                  }}
                >
                  <StyledFieldContainer>
                    <StyledAddFieldButtonContentContainer>
                      <IconPlus size={theme.icon.size.sm} />
                      {t`Add Field`}
                    </StyledAddFieldButtonContentContainer>
                  </StyledFieldContainer>
                </FormFieldInputInnerContainer>
              </FormFieldInputRowContainer>
            </FormFieldInputContainer>
          </StyledAddFieldButtonContainer>
        )}
      </StyledWorkflowStepBody>
    </>
  );
};
