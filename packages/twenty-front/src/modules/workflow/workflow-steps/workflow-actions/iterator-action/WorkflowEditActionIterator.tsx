import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { type WorkflowIteratorAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { useWorkflowActionHeader } from '@/workflow/workflow-steps/workflow-actions/hooks/useWorkflowActionHeader';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

type WorkflowEditActionIteratorProps = {
  action: WorkflowIteratorAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowIteratorAction) => void;
      };
};

export const WorkflowEditActionIterator = ({
  action,
  actionOptions,
}: WorkflowEditActionIteratorProps) => {
  const { headerTitle, headerIcon, headerIconColor, headerType, getIcon } =
    useWorkflowActionHeader({
      action,
      defaultTitle: 'Iterator',
    });

  const { t } = useLingui();

  const [formData, setFormData] = useState({
    items: action.settings.input.items || [],
    initialLoopStepIds: action.settings.input.initialLoopStepIds || [],
  });

  const saveAction = useDebouncedCallback(
    (updatedFormData: typeof formData) => {
      if (actionOptions.readonly === true) {
        return;
      }

      actionOptions.onActionUpdate?.({
        ...action,
        settings: {
          ...action.settings,
          input: {
            items: updatedFormData.items,
            initialLoopStepIds: updatedFormData.initialLoopStepIds,
          },
        },
      });
    },
    1000,
  );

  const handleFieldChange = (field: string, value: any) => {
    if (actionOptions.readonly === true) {
      return;
    }

    const updatedFormData = { ...formData, [field]: value };
    setFormData(updatedFormData);
    saveAction(updatedFormData);
  };

  const handleTitleChange = (newName: string) => {
    if (actionOptions.readonly === true) {
      return;
    }

    actionOptions.onActionUpdate?.({
      ...action,
      name: newName,
    });
  };

  return (
    <>
      <WorkflowStepHeader
        onTitleChange={handleTitleChange}
        Icon={getIcon(headerIcon || 'IconRepeat')}
        iconColor={headerIconColor}
        initialTitle={headerTitle}
        headerType={headerType}
        disabled={actionOptions.readonly}
      />
      <WorkflowStepBody>
        <FormTextFieldInput
          label={t`Items to iterate over`}
          placeholder={t`Enter array of items or variable expression`}
          defaultValue={
            Array.isArray(formData.items)
              ? JSON.stringify(formData.items)
              : (formData.items as string) || ''
          }
          onChange={(value: string) => handleFieldChange('items', value)}
          readonly={actionOptions.readonly}
          VariablePicker={WorkflowVariablePicker}
        />
      </WorkflowStepBody>
    </>
  );
};
