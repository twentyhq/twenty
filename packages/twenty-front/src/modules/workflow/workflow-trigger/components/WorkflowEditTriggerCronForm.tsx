import { FormNumberFieldInput } from '@/object-record/record-field/form-types/components/FormNumberFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { WorkflowCronTrigger } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { CRON_TRIGGER_INTERVAL_OPTIONS } from '@/workflow/workflow-trigger/constants/CronTriggerIntervalOptions';
import { getCronTriggerDefaultSettings } from '@/workflow/workflow-trigger/utils/getCronTriggerDefaultSettings';
import { getTriggerHeaderType } from '@/workflow/workflow-trigger/utils/getTriggerHeaderType';
import { getTriggerIcon } from '@/workflow/workflow-trigger/utils/getTriggerIcon';
import { getTriggerDefaultLabel } from '@/workflow/workflow-trigger/utils/getTriggerDefaultLabel';
import { useTheme } from '@emotion/react';
import { t } from '@lingui/core/macro';
import { isNumber } from '@sniptt/guards';
import cron from 'cron-validate';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

type WorkflowEditTriggerCronFormProps = {
  trigger: WorkflowCronTrigger;
  triggerOptions:
    | {
        readonly: true;
        onTriggerUpdate?: undefined;
      }
    | {
        readonly?: false;
        onTriggerUpdate: (trigger: WorkflowCronTrigger) => void;
      };
};

type FormErrorMessages = {
  CUSTOM?: string | undefined;
  DAYS_day?: string | undefined;
  DAYS_hour?: string | undefined;
  DAYS_minute?: string | undefined;
  HOURS_hour?: string | undefined;
  HOURS_minute?: string | undefined;
  MINUTES?: string | undefined;
};

export const WorkflowEditTriggerCronForm = ({
  trigger,
  triggerOptions,
}: WorkflowEditTriggerCronFormProps) => {
  const theme = useTheme();
  const [errorMessages, setErrorMessages] = useState<FormErrorMessages>({});
  const [errorMessagesVisible, setErrorMessagesVisible] = useState(false);

  const { getIcon } = useIcons();

  const headerIcon = getTriggerIcon(trigger);

  const defaultLabel = getTriggerDefaultLabel(trigger);
  const headerTitle = trigger.name ?? defaultLabel;
  const headerType = getTriggerHeaderType(trigger);

  const onBlur = () => {
    setErrorMessagesVisible(true);
  };

  return (
    <>
      <WorkflowStepHeader
        onTitleChange={(newName: string) => {
          if (triggerOptions.readonly === true) {
            return;
          }

          triggerOptions.onTriggerUpdate({
            ...trigger,
            name: newName,
          });
        }}
        Icon={getIcon(headerIcon)}
        iconColor={theme.font.color.tertiary}
        initialTitle={headerTitle}
        headerType={headerType}
        disabled={triggerOptions.readonly}
      />
      <WorkflowStepBody>
        <Select
          dropdownId="workflow-edit-cron-trigger-interval"
          label={t`Trigger interval`}
          fullWidth
          disabled={triggerOptions.readonly}
          value={trigger.settings.type}
          options={CRON_TRIGGER_INTERVAL_OPTIONS}
          onChange={(newTriggerType) => {
            if (triggerOptions.readonly === true) {
              return;
            }

            setErrorMessages({});

            setErrorMessagesVisible(false);

            triggerOptions.onTriggerUpdate({
              ...trigger,
              settings: getCronTriggerDefaultSettings(newTriggerType),
            });
          }}
          withSearchInput
          dropdownOffset={{ y: parseInt(theme.spacing(1), 10) }}
          dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
        />
        {trigger.settings.type === 'CUSTOM' && (
          <FormTextFieldInput
            label={t`Expression`}
            placeholder="0 */1 * * *"
            error={errorMessagesVisible ? errorMessages.CUSTOM : undefined}
            onBlur={onBlur}
            hint="Format: [Minute] [Hour] [Day of Month] [Month] [Day of Week]"
            readonly={triggerOptions.readonly}
            defaultValue={trigger.settings.pattern}
            onChange={(newPattern: string) => {
              if (triggerOptions.readonly === true) {
                return;
              }

              const cronValidator = cron(newPattern);

              if (cronValidator.isError() === true) {
                setErrorMessages({
                  CUSTOM: `Invalid cron pattern, ${cronValidator
                    .getError()[0]
                    .replace(/\. \(Input cron:.*$/, '')}`,
                });
                return;
              }

              setErrorMessages((prev) => ({
                ...prev,
                CUSTOM: undefined,
              }));

              triggerOptions.onTriggerUpdate({
                ...trigger,
                settings: {
                  ...trigger.settings,
                  type: 'CUSTOM',
                  pattern: newPattern,
                },
              });
            }}
          />
        )}
        {trigger.settings.type === 'DAYS' && (
          <>
            <FormNumberFieldInput
              label={t`Days between triggers`}
              error={errorMessagesVisible ? errorMessages.DAYS_day : undefined}
              onBlur={onBlur}
              defaultValue={trigger.settings.schedule.day}
              onChange={(newDay) => {
                if (triggerOptions.readonly === true) {
                  return;
                }

                if (!isDefined(newDay)) {
                  return;
                }

                if (!isNumber(newDay) || newDay <= 0) {
                  setErrorMessages((prev) => ({
                    ...prev,
                    DAYS_day: `Invalid day value '${newDay}'. Should be integer greater than 1`,
                  }));
                  return;
                }

                setErrorMessages((prev) => ({
                  ...prev,
                  DAYS_day: undefined,
                }));

                triggerOptions.onTriggerUpdate({
                  ...trigger,
                  settings: {
                    ...trigger.settings,
                    type: 'DAYS',
                    schedule: {
                      day: newDay,
                      hour:
                        trigger.settings.type === 'DAYS'
                          ? trigger.settings.schedule.hour
                          : 0,
                      minute:
                        trigger.settings.type === 'DAYS'
                          ? trigger.settings.schedule.minute
                          : 0,
                    },
                  },
                });
              }}
              placeholder="Enter number greater than 1"
              readonly={triggerOptions.readonly}
            />
            <FormNumberFieldInput
              label={t`Trigger at hour`}
              error={errorMessagesVisible ? errorMessages.DAYS_hour : undefined}
              onBlur={onBlur}
              defaultValue={trigger.settings.schedule.hour}
              onChange={(newHour) => {
                if (triggerOptions.readonly === true) {
                  return;
                }

                if (!isDefined(newHour)) {
                  return;
                }

                if (!isNumber(newHour) || newHour < 0 || newHour > 23) {
                  setErrorMessages((prev) => ({
                    ...prev,
                    DAYS_hour: `Invalid hour value '${newHour}'. Should be integer between 0 and 23`,
                  }));
                  return;
                }

                setErrorMessages((prev) => ({
                  ...prev,
                  DAYS_hour: undefined,
                }));

                triggerOptions.onTriggerUpdate({
                  ...trigger,
                  settings: {
                    ...trigger.settings,
                    type: 'DAYS',
                    schedule: {
                      day:
                        trigger.settings.type === 'DAYS'
                          ? trigger.settings.schedule.day
                          : 1,
                      hour: newHour,
                      minute:
                        trigger.settings.type === 'DAYS'
                          ? trigger.settings.schedule.minute
                          : 0,
                    },
                  },
                });
              }}
              placeholder="Enter number between 0 and 23"
              readonly={triggerOptions.readonly}
            />
            <FormNumberFieldInput
              label={t`Trigger at minute`}
              error={
                errorMessagesVisible ? errorMessages.DAYS_minute : undefined
              }
              onBlur={onBlur}
              defaultValue={trigger.settings.schedule.minute}
              onChange={(newMinute) => {
                if (triggerOptions.readonly === true) {
                  return;
                }

                if (!isDefined(newMinute)) {
                  return;
                }

                if (!isNumber(newMinute) || newMinute < 0 || newMinute > 59) {
                  setErrorMessages((prev) => ({
                    ...prev,
                    DAYS_minute: `Invalid minute value '${newMinute}'. Should be integer between 0 and 59`,
                  }));
                  return;
                }

                setErrorMessages((prev) => ({
                  ...prev,
                  DAYS_minute: undefined,
                }));

                triggerOptions.onTriggerUpdate({
                  ...trigger,
                  settings: {
                    ...trigger.settings,
                    type: 'DAYS',
                    schedule: {
                      day:
                        trigger.settings.type === 'DAYS'
                          ? trigger.settings.schedule.day
                          : 1,
                      hour:
                        trigger.settings.type === 'DAYS'
                          ? trigger.settings.schedule.hour
                          : 0,
                      minute: newMinute,
                    },
                  },
                });
              }}
              placeholder="Enter number between 0 and 59"
              readonly={triggerOptions.readonly}
            />
          </>
        )}
        {trigger.settings.type === 'HOURS' && (
          <>
            <FormNumberFieldInput
              label={t`Hours between triggers`}
              error={
                errorMessagesVisible ? errorMessages.HOURS_hour : undefined
              }
              onBlur={onBlur}
              defaultValue={trigger.settings.schedule.hour}
              onChange={(newHour) => {
                if (triggerOptions.readonly === true) {
                  return;
                }

                if (!isDefined(newHour)) {
                  return;
                }

                if (!isNumber(newHour) || newHour <= 0) {
                  setErrorMessages((prev) => ({
                    ...prev,
                    HOURS_hour: `Invalid hour value '${newHour}'. Should be integer greater than 1`,
                  }));
                  return;
                }

                setErrorMessages((prev) => ({
                  ...prev,
                  HOURS_hour: undefined,
                }));

                triggerOptions.onTriggerUpdate({
                  ...trigger,
                  settings: {
                    ...trigger.settings,
                    type: 'HOURS',
                    schedule: {
                      hour: newHour,
                      minute:
                        trigger.settings.type === 'HOURS'
                          ? trigger.settings.schedule.minute
                          : 0,
                    },
                  },
                });
              }}
              placeholder="Enter number greater than 1"
              readonly={triggerOptions.readonly}
            />
            <FormNumberFieldInput
              label={t`Trigger at minute`}
              error={
                errorMessagesVisible ? errorMessages.HOURS_minute : undefined
              }
              onBlur={onBlur}
              defaultValue={trigger.settings.schedule.minute}
              onChange={(newMinute) => {
                if (triggerOptions.readonly === true) {
                  return;
                }

                if (!isDefined(newMinute)) {
                  return;
                }

                if (!isNumber(newMinute) || newMinute < 0 || newMinute > 59) {
                  setErrorMessages((prev) => ({
                    ...prev,
                    HOURS_minute: `Invalid minute value '${newMinute}'. Should be integer between 0 and 59`,
                  }));
                  return;
                }

                setErrorMessages((prev) => ({
                  ...prev,
                  HOURS_minute: undefined,
                }));

                triggerOptions.onTriggerUpdate({
                  ...trigger,
                  settings: {
                    ...trigger.settings,
                    type: 'HOURS',
                    schedule: {
                      hour:
                        trigger.settings.type === 'HOURS'
                          ? trigger.settings.schedule.hour
                          : 1,
                      minute: newMinute,
                    },
                  },
                });
              }}
              placeholder="Enter number between 0 and 59"
              readonly={triggerOptions.readonly}
            />
          </>
        )}
        {trigger.settings.type === 'MINUTES' && (
          <FormNumberFieldInput
            label={t`Minutes between triggers`}
            error={errorMessagesVisible ? errorMessages.MINUTES : undefined}
            onBlur={onBlur}
            defaultValue={trigger.settings.schedule.minute}
            onChange={(newMinute) => {
              if (triggerOptions.readonly === true) {
                return;
              }

              if (!isDefined(newMinute)) {
                return;
              }

              if (!isNumber(newMinute) || newMinute <= 0) {
                setErrorMessages({
                  MINUTES: `Invalid minute value '${newMinute}'. Should be integer greater than 1`,
                });
                return;
              }

              setErrorMessages((prev) => ({
                ...prev,
                MINUTES: undefined,
              }));

              triggerOptions.onTriggerUpdate({
                ...trigger,
                settings: {
                  ...trigger.settings,
                  type: 'MINUTES',
                  schedule: {
                    minute: newMinute,
                  },
                },
              });
            }}
            placeholder="Enter number greater than 1"
            readonly={triggerOptions.readonly}
          />
        )}
      </WorkflowStepBody>
    </>
  );
};
