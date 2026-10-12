import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { FormFieldPlaceholder } from '@/object-record/record-field/ui/form-types/components/FormFieldPlaceholder';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { InputLabel } from '@/ui/input/components/internal/InputLabel/InputLabel';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { type DraggableListDropResult } from '@/ui/layout/draggable-list/types/DraggableListDropResult';
import { DragDropItemSortableHandle } from '@/ui/utilities/drag-and-drop/components/DragDropItemSortableHandle';
import {
  type WorkflowFormAction,
  type WorkflowTriggerType,
} from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { WorkflowEditActionFormFieldSettings } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowEditActionFormFieldSettings';
import { type WorkflowFormActionField } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormActionField';
import { getDefaultFormFieldSettings } from '@/workflow/workflow-steps/workflow-actions/form-action/utils/getDefaultFormFieldSettings';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Callout } from 'twenty-ui/components/feedback';
import { LightIconButton } from 'twenty-ui/components/input';
import {
  IconAlertTriangle,
  IconChevronDown,
  IconGripVertical,
  IconPlus,
  IconTrash,
} from 'twenty-ui/icon';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';
import { useDebouncedCallback } from 'use-debounce';
import { v4 } from 'uuid';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { openUrlInNewTab } from '~/utils/openUrlInNewTab';

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
  margin-bottom: ${themeCssVariables.spacing[4]};
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
  height: 100%;
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

const StyledInstructionsContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[4]};
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
  const theme = useTheme();

  const [formData, setFormData] = useState<FormData>(action.settings.input);
  const [instructions, setInstructions] = useState(
    action.settings.instructions,
  );

  const [isCalloutVisible, setIsCalloutVisible] = useState<boolean>(true);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const isSendChatMessageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_SEND_CHAT_MESSAGE_ENABLED,
  );

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

    saveAction({ input: updatedFormData, instructions });
  };

  const handleDragEnd = ({ source, destination }: DraggableListDropResult) => {
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

    saveAction({ input: copiedFormData, instructions });
  };

  const saveAction = useDebouncedCallback(
    (settings: { input: FormData; instructions: string | undefined }) => {
      if (actionOptions.readonly === true) {
        return;
      }

      actionOptions.onActionUpdate({
        ...action,
        settings: { ...action.settings, ...settings },
      });
    },
    1_000,
  );

  const handleInstructionsChange = (updatedInstructions: string) => {
    if (actionOptions.readonly === true) {
      return;
    }

    setInstructions(updatedInstructions);

    saveAction({ input: formData, instructions: updatedInstructions });
  };

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
              status={'warning'}
              icon={
                <IconAlertTriangle
                  size={themeCssVariables.icon.size.md}
                  aria-hidden="true"
                />
              }
              title={t`Forms are meant for manual triggers`}
              description={
                isSendChatMessageEnabled
                  ? t`A form opens for the person who launches the workflow and is filled in on the spot. With this trigger, it only shows in the workflow run. To ask someone for an answer or an approval in their inbox, use a Send to Inbox step instead.`
                  : t`A form opens for the person who launches the workflow and is filled in on the spot. With this trigger, it only shows in the workflow run.`
              }
              closeLabel={t`Close`}
              onDismiss={() => setIsCalloutVisible(false)}
              action={
                <Callout.Action
                  type="button"
                  onClick={() =>
                    openUrlInNewTab(
                      'https://docs.twenty.com/user-guide/workflows/capabilities/workflow-actions#form',
                    )
                  }
                >{t`Learn more`}</Callout.Action>
              }
            />
          </StyledCalloutContainer>
        )}
        <StyledInstructionsContainer>
          <FormTextFieldInput
            label={t`Instructions`}
            placeholder={t`Shown above the fields, for example what to fill in and why`}
            multiline
            readonly={actionOptions.readonly}
            defaultValue={instructions}
            onChange={handleInstructionsChange}
            VariablePicker={WorkflowVariablePicker}
          />
        </StyledInstructionsContainer>
        {formData.length === 0 && (
          <StyledNotClosableCalloutContainer>
            <Callout
              status={'neutral'}
              title={t`Add inputs to your form`}
              description={t`Click on "Add Field" below to add the first input to your form. The form pops up for the person who launches the workflow manually. For workflows with other triggers, it is filled in from the workflow run.`}
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
                  disableDraggingBackground
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
                            <DragDropItemSortableHandle>
                              <LightIconButton aria-label={t`Reorder field`}>
                                <IconGripVertical />
                              </LightIconButton>
                            </DragDropItemSortableHandle>
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
                              aria-label={t`Delete field`}
                              onClick={() => {
                                const updatedFormData = formData.filter(
                                  (currentField) =>
                                    currentField.id !== field.id,
                                );

                                setFormData(updatedFormData);

                                saveAction({
                                  input: updatedFormData,
                                  instructions,
                                });
                                saveAction.flush();
                              }}
                            >
                              <IconTrash />
                            </LightIconButton>
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

                    const updatedFormData = [...formData, newField];

                    setFormData(updatedFormData);

                    saveAction({ input: updatedFormData, instructions });
                    saveAction.flush();

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
