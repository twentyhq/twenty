import { SidePanelHeader } from '@/command-menu/components/SidePanelHeader';
import { FormDateTimeFieldInput } from '@/object-record/record-field/ui/form-types/components/FormDateTimeFieldInput';
import { Select } from '@/ui/input/components/Select';
import { type WorkflowDelayAction } from '@/workflow/types/Workflow';
import { WorkflowActionFooter } from '@/workflow/workflow-steps/components/WorkflowActionFooter';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { useWorkflowActionHeader } from '@/workflow/workflow-steps/workflow-actions/hooks/useWorkflowActionHeader';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { t } from '@lingui/core/macro';
import { useEffect, useState } from 'react';
import { HorizontalSeparator, IconCalendar } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';
import { useDebouncedCallback } from 'use-debounce';
type WorkflowEditActionDelayProps = {
  action: WorkflowDelayAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowDelayAction) => void;
      };
};

type DelayFormData = {
  scheduledDateTime: string | null;
};

export const WorkflowEditActionDelay = ({
  action,
  actionOptions,
}: WorkflowEditActionDelayProps) => {
  const { headerTitle, headerIcon, headerIconColor, headerType, getIcon } =
    useWorkflowActionHeader({
      action,
      defaultTitle: 'Delay',
    });

  const [formData, setFormData] = useState<DelayFormData>({
    scheduledDateTime: action.settings.input.scheduledDateTime ?? null,
  });

  const delayOptions: Array<SelectOption<string>> = [
    {
      label: 'At a specific date or time',
      value: 'specific_date_time',
      Icon: IconCalendar,
    },
  ];

  const saveAction = useDebouncedCallback(async (formData: DelayFormData) => {
    if (actionOptions.readonly === true) {
      return;
    }
    actionOptions.onActionUpdate({
      ...action,
      settings: {
        ...action.settings,
        input: {
          scheduledDateTime: formData.scheduledDateTime,
        },
      },
    });
  }, 1_000);

  useEffect(() => {
    return () => {
      saveAction.flush();
    };
  }, [saveAction]);

  const handleDateTimeChange = (value: string | null) => {
    const newFormData: DelayFormData = {
      ...formData,
      scheduledDateTime: value,
    };

    setFormData(newFormData);
    saveAction(newFormData);
  };

  const HeaderIcon = getIcon(headerIcon ?? 'IconPlayerPause');

  return (
    <>
      <SidePanelHeader
        initialTitle={headerTitle}
        Icon={HeaderIcon}
        iconColor={headerIconColor}
        headerType={headerType}
        onTitleChange={(newTitle: string) => {
          if (actionOptions.readonly === true) {
            return;
          }

          actionOptions.onActionUpdate({
            ...action,
            name: newTitle,
          });
        }}
      />

      <WorkflowStepBody>
        <Select
          dropdownId="workflow-edit-action-delay-duration"
          label="Resume"
          options={delayOptions}
          value="specific_date_time"
          onChange={() => {}}
        />
        <HorizontalSeparator noMargin />

        <FormDateTimeFieldInput
          label={t`Delay Until`}
          defaultValue={formData.scheduledDateTime ?? ''}
          onChange={handleDateTimeChange}
          readonly={actionOptions.readonly}
          VariablePicker={WorkflowVariablePicker}
          dateOnly={false}
        />
      </WorkflowStepBody>

      <WorkflowActionFooter stepId={action.id} />
    </>
  );
};
