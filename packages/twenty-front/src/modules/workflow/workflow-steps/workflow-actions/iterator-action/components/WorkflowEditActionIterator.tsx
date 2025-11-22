import { FormArrayFieldInput } from '@/object-record/record-field/ui/form-types/components/FormArrayFieldInput';
import { type FieldArrayValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type WorkflowIteratorAction } from '@/workflow/types/Workflow';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { useLingui } from '@lingui/react/macro';
import { isArray, isString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
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

const stringifyArrayItems = (array: FieldArrayValue) => {
  return array.map((item) => {
    if (!isDefined(item)) {
      return '';
    }

    if (isString(item)) {
      return item;
    }

    return JSON.stringify(item);
  });
};

export const WorkflowEditActionIterator = ({
  action,
  actionOptions,
}: WorkflowEditActionIteratorProps) => {
  const { t } = useLingui();

  const defaultItems = isDefined(action.settings.input.items)
    ? action.settings.input.items
    : [];

  const parsedItems = isStandaloneVariableString(defaultItems)
    ? defaultItems
    : isArray(defaultItems)
      ? stringifyArrayItems(defaultItems)
      : [];

  const [formData, setFormData] = useState({
    items: parsedItems,
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

  const handleFieldChange = (
    field: string,
    value: string | FieldArrayValue,
  ) => {
    if (actionOptions.readonly === true) {
      return;
    }

    const updatedFormData = { ...formData, [field]: value };
    setFormData(updatedFormData);
    saveAction(updatedFormData);
  };

  return (
    <>
      <WorkflowStepBody>
        <FormArrayFieldInput
          label={t`Items to iterate over`}
          placeholder={t`Enter array of items or variable expression`}
          defaultValue={formData.items}
          onChange={(value: string | FieldArrayValue) =>
            handleFieldChange('items', value)
          }
          readonly={actionOptions.readonly}
          VariablePicker={WorkflowVariablePicker}
        />
      </WorkflowStepBody>
      {!actionOptions.readonly && <WorkflowStepFooter stepId={action.id} />}
    </>
  );
};
