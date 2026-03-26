import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { FormFieldPlaceholder } from '@/object-record/record-field/ui/form-types/components/FormFieldPlaceholder';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import {
  type WorkflowFormAction,
  type WorkflowTriggerType,
} from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { WorkflowEditActionFormFieldSettings } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowEditActionFormFieldSettings';
import { type WorkflowFormActionField } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormActionField';
import { getDefaultFormFieldSettings } from '@/workflow/workflow-steps/workflow-actions/form-action/utils/getDefaultFormFieldSettings';
import { styled } from '@linaria/react';
import { type OnDragEndResponder } from '@hello-pangea/dnd';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext, useEffect, useState } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  Callout,
  IconAlertTriangle,
  IconChevronDown,
  IconGripVertical,
  IconPlus,
  IconTrash,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { useDebouncedCallback } from 'use-debounce';
import { v4 } from 'uuid';
import { themeCssVariables, ThemeContext } from 'twenty-ui/theme-constants';

export type WorkflowEditActionFormBuilderProps = {
  triggerType: WorkflowTriggerType | undefined;
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

const StyledFormFieldContainer = styled.div`
  align-items: flex-end;
  column-gap: ${themeCssVariables.spacing[1]};
  display: grid;
  grid-template-areas:
    'grip input delete'
    '. settings .';
  grid-template-columns: 24px 1fr 24px;
  position: relative;
`;

const StyledDraggingIndicator = styled.div`
  background-color: ${themeCssVariables.background.transparent.light};
  inset: -8px;
  position: absolute;
  top: -4px;
`;

const StyledGripButtonContainer = styled.div`
  align-items: flex-end;
  display: flex;
  grid-area: grip;
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledTrashButtonContainer = styled.div`
  align-items: flex-end;
  display: flex;
  grid-area: delete;
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledFormFieldInputContainerWrapper = styled.div`
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
  cursor: ${({ readonly }) => (readonly ? 'default' : 'pointer')};
  display: flex;
  font-family: inherit;
  padding-left: ${themeCssVariables.spacing[2]};
  padding-right: ${themeCssVariables.spacing[2]};

  width: 100%;

  &:hover,
  &[data-open='true'] {
    background-color: ${({ readonly }) =>
      readonly
        ? 'transparent'
        : themeCssVariables.background.transparent.lighter};
  }
`;

const StyledPlaceholderContainer = styled.div`
  width: 100%;
`;

const StyledAddFieldButtonContainer = styled.div`
  padding-left: ${themeCssVariables.spacing[7]};
  padding-right: ${themeCssVariables.spacing[7]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledAddFieldButtonContentContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[0.5]};
  justify-content: center;
  width: 100%;
`;

const StyledCalloutContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
  padding-left: ${themeCssVariables.spacing[7]};
  padding-right: ${themeCssVariables.spacing[7]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledNotClosableCalloutContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[4]};
  padding-left: ${themeCssVariables.spacing[7]};
  padding-right: ${themeCssVariables.spacing[7]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

export const WorkflowEditActionFormBuilder = ({
  triggerType,
  action,
  actionOptions,
}: WorkflowEditActionFormBuilderProps) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);

  const [formData, setFormData] = useState<FormData>(action.settings.input);

  const [isCalloutVisible, setIsCalloutVisible] = useState<boolean>(true);
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
      <WorkflowStepBody
        display="block"
        paddingInline={themeCssVariables.spacing[2]}
      >
        {triggerType && triggerType !== 'MANUAL' && isCalloutVisible && (
          <StyledCalloutContainer>
            <Callout
              variant={'warning'}
              Icon={IconAlertTriangle}
              title={t`This form will appear in workflow runs.`}
              description={t`Because this workflow is not using a manual trigger, the form will not open on top of the interface. To fill it, open the corresponding workflow run and complete the form there.`}
              isClosable
              onClose={() => setIsCalloutVisible(false)}
              action={{
                label: t`Learn more`,
                onClick: () =>
                  window.open(
                    'https://docs.twenty.com/user-guide/workflows/capabilities/workflow-actions#form',
                    '_blank',
                    'noopener,noreferrer',
                  ),
              }}
            />
          </StyledCalloutContainer>
        )}
        {formData.length === 0 && (
          <StyledNotClosableCalloutContainer>
            <Callout
              variant={'neutral'}
              isClosable={false}
              title={t`Add inputs to your form`}
              description={t`Click on "Add Field" below to add the first input to your form. The form will pop up on the user's screen when the workflow is launched from a manual trigger. For other types of triggers, it will be displayed in the Workflow run record page.`}
            />
          </StyledNotClosableCalloutContainer>
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
                    marginBottom: themeCssVariables.spacing[4],
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
                          <StyledGripButtonContainer>
                            <LightIconButton
                              Icon={IconGripVertical}
                              aria-label={t`Reorder field`}
                            />
                          </StyledGripButtonContainer>
                        )}

                        <StyledFormFieldInputContainerWrapper>
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
                                <StyledPlaceholderContainer>
                                  <FormFieldPlaceholder>
                                    {isDefined(field.placeholder) &&
                                    isNonEmptyString(field.placeholder)
                                      ? field.placeholder
                                      : getDefaultFormFieldSettings(field.type)
                                          .placeholder}
                                  </FormFieldPlaceholder>
                                </StyledPlaceholderContainer>
                                {(field.type === 'RECORD' ||
                                  field.type === 'SELECT' ||
                                  field.type === 'MULTI_SELECT') && (
                                  <IconChevronDown
                                    size={theme.icon.size.md}
                                    color={
                                      themeCssVariables.font.color.tertiary
                                    }
                                  />
                                )}
                              </StyledFieldContainer>
                            </FormFieldInputInnerContainer>
                          </FormFieldInputRowContainer>
                        </StyledFormFieldInputContainerWrapper>

                        {showButtons && (
                          <StyledTrashButtonContainer>
                            <LightIconButton
                              Icon={IconTrash}
                              aria-label={t`Delete field`}
                              onClick={() => {
                                const updatedFormData = formData.filter(
                                  (currentField) =>
                                    currentField.id !== field.id,
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
                          </StyledTrashButtonContainer>
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
      </WorkflowStepBody>
      {!actionOptions.readonly && <WorkflowStepFooter stepId={action.id} />}
    </>
  );
};
