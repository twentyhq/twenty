import { SidePanelHeader } from '@/command-menu/components/SidePanelHeader';
import { FormDateTimeFieldInput } from '@/object-record/record-field/ui/form-types/components/FormDateTimeFieldInput';
import { FormNumberFieldInput } from '@/object-record/record-field/ui/form-types/components/FormNumberFieldInput';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { type WorkflowDelayAction } from '@/workflow/types/Workflow';
import { WorkflowActionFooter } from '@/workflow/workflow-steps/components/WorkflowActionFooter';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { useWorkflowActionHeader } from '@/workflow/workflow-steps/workflow-actions/hooks/useWorkflowActionHeader';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { t } from '@lingui/core/macro';
import { useEffect, useState } from 'react';
import {
  HorizontalSeparator,
  IconCalendar,
  IconClockHour8,
} from 'twenty-ui/display';
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
  delayType: 'schedule_date' | 'duration';
  scheduledDateTime: string | null;
  duration: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
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

  const [formData, setFormData] = useState<DelayFormData>(() => {
    const input = action.settings.input;
    return {
      delayType: input.delayType ?? 'duration',
      scheduledDateTime: input.scheduledDateTime ?? null,
      duration: input.duration ?? {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      },
    };
  });

  const delayOptions: Array<SelectOption<string>> = [
    {
      label: t`At a specific date or time`,
      value: 'schedule_date',
      Icon: IconCalendar,
    },
    {
      label: t`After a set amount of time`,
      value: 'duration',
      Icon: IconClockHour8,
    },
  ];

  const saveAction = useDebouncedCallback((formData: DelayFormData) => {
    if (actionOptions.readonly === true) {
      return;
    }
    actionOptions.onActionUpdate({
      ...action,
      settings: {
        ...action.settings,
        input: {
          delayType: formData.delayType,
          scheduledDateTime:
            formData.delayType === 'schedule_date'
              ? formData.scheduledDateTime
              : null,
          duration:
            formData.delayType === 'duration' ? formData.duration : undefined,
        },
      },
    });
  }, 1_000);

  useEffect(() => {
    return () => {
      saveAction.flush();
    };
  }, [saveAction]);

  const handleDelayTypeChange = (value: string) => {
    const delayType = value === 'schedule_date' ? 'schedule_date' : 'duration';
    const newFormData: DelayFormData = {
      ...formData,
      delayType,
    };

    setFormData(newFormData);
    saveAction(newFormData);
  };

  const handleDateTimeChange = (value: string | null) => {
    const newFormData: DelayFormData = {
      ...formData,
      scheduledDateTime: value,
    };

    setFormData(newFormData);
    saveAction(newFormData);
  };

  const handleDurationChange = (
    field: keyof DelayFormData['duration'],
    value: number | null | string,
  ) => {
    const numberValue = value === null || value === '' ? 0 : Number(value);
    const newFormData: DelayFormData = {
      ...formData,
      duration: {
        ...formData.duration,
        [field]: numberValue,
      },
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
          dropdownId="workflow-edit-action-delay-type"
          label={t`Resume`}
          options={delayOptions}
          dropdownWidth={GenericDropdownContentWidth.Large}
          value={formData.delayType}
          onChange={handleDelayTypeChange}
          disabled={actionOptions.readonly}
        />
        <HorizontalSeparator noMargin />

        {formData.delayType === 'schedule_date' ? (
          <FormDateTimeFieldInput
            label={t`Delay Until Date`}
            defaultValue={formData.scheduledDateTime ?? ''}
            onChange={handleDateTimeChange}
            readonly={actionOptions.readonly}
            VariablePicker={WorkflowVariablePicker}
            placeholder="Select a date"
          />
        ) : (
          <>
            <FormNumberFieldInput
              label={t`Days`}
              defaultValue={formData.duration.days}
              onChange={(value) => handleDurationChange('days', value)}
              readonly={actionOptions.readonly}
              VariablePicker={WorkflowVariablePicker}
              placeholder="0"
            />
            <FormNumberFieldInput
              label={t`Hours`}
              defaultValue={formData.duration.hours}
              onChange={(value) => handleDurationChange('hours', value)}
              readonly={actionOptions.readonly}
              VariablePicker={WorkflowVariablePicker}
              placeholder="0"
            />
            <FormNumberFieldInput
              label={t`Minutes`}
              defaultValue={formData.duration.minutes}
              onChange={(value) => handleDurationChange('minutes', value)}
              readonly={actionOptions.readonly}
              VariablePicker={WorkflowVariablePicker}
              placeholder="0"
            />
            <FormNumberFieldInput
              label={t`Seconds`}
              defaultValue={formData.duration.seconds}
              onChange={(value) => handleDurationChange('seconds', value)}
              readonly={actionOptions.readonly}
              VariablePicker={WorkflowVariablePicker}
              placeholder="0"
            />
          </>
        )}
      </WorkflowStepBody>

      <WorkflowActionFooter stepId={action.id} />
    </>
  );
};
