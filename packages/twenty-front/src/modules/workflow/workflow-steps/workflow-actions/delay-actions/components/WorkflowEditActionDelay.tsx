import { SidePanelHeader } from '@/command-menu/components/SidePanelHeader';
import { FormDateTimeFieldInput } from '@/object-record/record-field/ui/form-types/components/FormDateTimeFieldInput';
import { FormNumberFieldInput } from '@/object-record/record-field/ui/form-types/components/FormNumberFieldInput';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { type WorkflowDelayAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { DELAY_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/DelayAction';
import { useWorkflowActionHeader } from '@/workflow/workflow-steps/workflow-actions/hooks/useWorkflowActionHeader';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { t } from '@lingui/core/macro';
import {
  HorizontalSeparator,
  IconCalendar,
  IconHourglassHigh,
} from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';
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

export const WorkflowEditActionDelay = ({
  action,
  actionOptions,
}: WorkflowEditActionDelayProps) => {
  const { headerTitle, headerIcon, headerIconColor, headerType, getIcon } =
    useWorkflowActionHeader({
      action,
      defaultTitle: DELAY_ACTION.defaultLabel,
    });

  const delayOptions: Array<SelectOption<'SCHEDULED_DATE' | 'DURATION'>> = [
    {
      label: t`At a specific date or time`,
      value: 'SCHEDULED_DATE',
      Icon: IconCalendar,
    },
    {
      label: t`After a set amount of time`,
      value: 'DURATION',
      Icon: IconHourglassHigh,
    },
  ];

  const handleDelayTypeChange = (
    newDelayType: 'SCHEDULED_DATE' | 'DURATION',
  ) => {
    if (
      actionOptions.readonly === true ||
      newDelayType === action.settings.input.delayType
    ) {
      return;
    }

    if (newDelayType === 'SCHEDULED_DATE') {
      actionOptions.onActionUpdate({
        ...action,
        settings: {
          ...action.settings,
          input: {
            delayType: 'SCHEDULED_DATE',
          },
        },
      });
    } else {
      actionOptions.onActionUpdate({
        ...action,
        settings: {
          ...action.settings,
          input: {
            delayType: 'DURATION',
            duration: undefined,
          },
        },
      });
    }
  };

  const handleDateTimeChange = (value: string | null) => {
    if (actionOptions.readonly === true) {
      return;
    }

    actionOptions.onActionUpdate({
      ...action,
      settings: {
        ...action.settings,
        input: {
          delayType: 'SCHEDULED_DATE',
          scheduledDateTime: value ?? '',
        },
      },
    });
  };

  const handleDurationChange = (
    field: 'days' | 'hours' | 'minutes' | 'seconds',
    value: number | string | null,
  ) => {
    if (actionOptions.readonly === true) {
      return;
    }

    actionOptions.onActionUpdate({
      ...action,
      settings: {
        ...action.settings,
        input: {
          delayType: 'DURATION',
          duration: {
            days:
              field === 'days'
                ? (value ?? undefined)
                : action.settings.input.duration?.days,
            hours:
              field === 'hours'
                ? (value ?? undefined)
                : action.settings.input.duration?.hours,
            minutes:
              field === 'minutes'
                ? (value ?? undefined)
                : action.settings.input.duration?.minutes,
            seconds:
              field === 'seconds'
                ? (value ?? undefined)
                : action.settings.input.duration?.seconds,
          },
        },
      },
    });
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
        iconTooltip={DELAY_ACTION.defaultLabel}
      />

      <WorkflowStepBody>
        <Select
          dropdownId="workflow-edit-action-delay-type"
          label={t`Resume`}
          options={delayOptions}
          dropdownWidth={GenericDropdownContentWidth.Large}
          value={action.settings.input.delayType}
          onChange={handleDelayTypeChange}
          disabled={actionOptions.readonly}
        />
        <HorizontalSeparator noMargin />

        {action.settings.input.delayType === 'SCHEDULED_DATE' && (
          <FormDateTimeFieldInput
            label={t`Delay until date`}
            defaultValue={action.settings.input.scheduledDateTime ?? undefined}
            onChange={handleDateTimeChange}
            readonly={actionOptions.readonly}
            VariablePicker={WorkflowVariablePicker}
            placeholder="Select a date"
          />
        )}
        {action.settings.input.delayType === 'DURATION' && (
          <>
            <FormNumberFieldInput
              label={t`Days`}
              defaultValue={action.settings.input.duration?.days}
              onChange={(value) => handleDurationChange('days', value)}
              readonly={actionOptions.readonly}
              VariablePicker={WorkflowVariablePicker}
              placeholder="0"
            />
            <FormNumberFieldInput
              label={t`Hours`}
              defaultValue={action.settings.input.duration?.hours}
              onChange={(value) => handleDurationChange('hours', value)}
              readonly={actionOptions.readonly}
              VariablePicker={WorkflowVariablePicker}
              placeholder="0"
            />
            <FormNumberFieldInput
              label={t`Minutes`}
              defaultValue={action.settings.input.duration?.minutes}
              onChange={(value) => handleDurationChange('minutes', value)}
              readonly={actionOptions.readonly}
              VariablePicker={WorkflowVariablePicker}
              placeholder="0"
            />
            <FormNumberFieldInput
              label={t`Seconds`}
              defaultValue={action.settings.input.duration?.seconds}
              onChange={(value) => handleDurationChange('seconds', value)}
              readonly={actionOptions.readonly}
              VariablePicker={WorkflowVariablePicker}
              placeholder="0"
            />
          </>
        )}
      </WorkflowStepBody>

      <WorkflowStepFooter stepId={action.id} />
    </>
  );
};
