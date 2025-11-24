import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { FormFieldPlaceholder } from '@/object-record/record-field/ui/form-types/components/FormFieldPlaceholder';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { type WorkflowFormAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { WorkflowEditActionFormFieldSettings } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowEditActionFormFieldSettings';
import { WorkflowFormEmptyMessage } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowFormEmptyMessage';
import { type WorkflowFormActionField } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormActionField';
import { getDefaultFormFieldSettings } from '@/workflow/workflow-steps/workflow-actions/form-action/utils/getDefaultFormFieldSettings';
import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { type OnDragEndResponder } from '@hello-pangea/dnd';
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
  display: block;
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
  position: relative;
`;

const StyledDraggingIndicator = styled.div`
  position: absolute;
  inset: ${({ theme }) => theme.spacing(-2)};
  top: ${({ theme }) => theme.spacing(-1)};
  background-color: ${({ theme }) => theme.background.transparent.light};
`;

const StyledLightGripIconButton = styled(LightIconButton)`
  grid-area: grip;
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledLightTrashIconButton = styled(LightIconButton)`
  grid-area: delete;
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledFormFieldInputContainer = styled(FormFieldInputContainer)`
  grid-area: input;
`;

const StyledOpenedSettingsContainer = styled.div`
  grid-area: settings;
`;

const StyledFieldContainer = styled.div<{
  readonly?: boolean;
}>`
  align-items: center;
  background: transparent;
  border: none;
  display: flex;
  font-family: inherit;
  padding-inline: ${({ theme }) => theme.spacing(2)};
  width: 100%;

  cursor: ${({ readonly }) => (readonly ? 'default' : 'pointer')};

  ${({ readonly, theme }) =>
    !readonly &&
    css`
      &:hover,
      &[data-open='true'] {
        background-color: ${theme.background.transparent.lighter};
      }
    `}
`;

const StyledPlaceholder = styled(FormFieldPlaceholder)`
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
  const { t } = useLingui();

  const [formData, setFormData] = useState<FormData>(action.settings.input);

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

  const handleDragEnd: OnDragEndResponder = ({ source, destination }) => {
    if (actionOptions.readonly === true) {
      return;
    }

    const movedField = formData.at(source.index);

    if (!isDefined(movedField) || !isDefined(destination)) {
      return;
    }

    const copiedFormData = [...formData];

    copiedFormData.splice(source.index, 1);
    copiedFormData.splice(destination.index, 0, movedField);

    setFormData(copiedFormData);

    saveAction(copiedFormData);
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
      <StyledWorkflowStepBody>
        {formData.length === 0 && (
          <WorkflowFormEmptyMessage data-testid="empty-form-message" />
        )}
        <DraggableList
          onDragEnd={handleDragEnd}
          draggableItems={
            <>
              {formData.map((field, index) => (
                <DraggableItem
                  key={field.id}
                  draggableId={field.id}
                  index={index}
                  isDragDisabled={actionOptions.readonly}
                  isInsideScrollableContainer
                  disableDraggingBackground
                  draggableComponentStyles={{
                    marginBottom: theme.spacing(4),
                  }}
                  itemComponent={({ isDragging }) => {
                    const showButtons =
                      !actionOptions.readonly &&
                      (isFieldSelected(field.id) ||
                        isFieldHovered(field.id) ||
                        isDragging);

                    return (
                      <StyledFormFieldContainer
                        key={field.id}
                        onMouseEnter={() => setHoveredField(field.id)}
                        onMouseLeave={() => setHoveredField(null)}
                      >
                        {isDragging && <StyledDraggingIndicator />}

                        {showButtons && (
                          <StyledLightGripIconButton
                            Icon={IconGripVertical}
                            aria-label={t`Reorder field`}
                          />
                        )}

                        <StyledFormFieldInputContainer>
                          <InputLabel>{field.label || ''}</InputLabel>

                          <FormFieldInputRowContainer>
                            <FormFieldInputInnerContainer
                              formFieldInputInstanceId={field.id}
                              hasRightElement={false}
                              onClick={() => {
                                handleFieldClick(field.id);
                              }}
                            >
                              <StyledFieldContainer
                                readonly={actionOptions.readonly}
                              >
                                <StyledPlaceholder>
                                  {isDefined(field.placeholder) &&
                                  isNonEmptyString(field.placeholder)
                                    ? field.placeholder
                                    : getDefaultFormFieldSettings(field.type)
                                        .placeholder}
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
                        </StyledFormFieldInputContainer>

                        {showButtons && (
                          <StyledLightTrashIconButton
                            Icon={IconTrash}
                            aria-label={t`Delete field`}
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
                    );
                  }}
                />
              ))}
            </>
          }
        />

        {!actionOptions.readonly && (
          <StyledAddFieldButtonContainer>
            <FormFieldInputContainer>
              <FormFieldInputRowContainer>
                <FormFieldInputInnerContainer
                  formFieldInputInstanceId="add-field-button"
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
      {!actionOptions.readonly && <WorkflowStepFooter stepId={action.id} />}
    </>
  );
};
