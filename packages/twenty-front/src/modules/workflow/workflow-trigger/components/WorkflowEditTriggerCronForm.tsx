import { FormNumberFieldInput } from '@/object-record/record-field/form-types/components/FormNumberFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { Select } from '@/ui/input/components/Select';
import { WorkflowCronTrigger } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { CRON_TRIGGER_INTERVAL_OPTIONS } from '@/workflow/workflow-trigger/constants/CronTriggerIntervalOptions';
import { getCronTriggerDefaultSettings } from '@/workflow/workflow-trigger/utils/getCronTriggerDefaultSettings';
import { getTriggerIcon } from '@/workflow/workflow-trigger/utils/getTriggerIcon';
import { getTriggerDefaultLabel } from '@/workflow/workflow-trigger/utils/getTriggerLabel';
import { useTheme } from '@emotion/react';
import { isNumber } from '@sniptt/guards';
import cron from 'cron-validate';
import { useState } from 'react';
import { isDefined } from 'twenty-shared';
import { useIcons } from 'twenty-ui';

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

  const headerIcon = getTriggerIcon({
    type: 'CRON',
  });

  const defaultLabel =
    getTriggerDefaultLabel({
      type: 'CRON',
    }) ?? '';

  const headerTitle = isDefined(trigger.name) ? trigger.name : defaultLabel;

  const headerType = 'Trigger';

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
          label="Trigger interval"
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
        />
        {trigger.settings.type === 'CUSTOM' && (
          <FormTextFieldInput
            label="Expression"
            placeholder="0 */1 * * *"
            error={errorMessagesVisible ? errorMessages.CUSTOM : undefined}
            onBlur={onBlur}
            hint="Format: [Second] [Minute] [Hour] [Day of Month] [Month] [Day of Week]"
            readonly={triggerOptions.readonly}
            defaultValue={trigger.settings.pattern}
            onPersist={(newPattern: string) => {
              if (triggerOptions.readonly === true) {
                return;
              }

              const cronValidator = cron(newPattern);

              if (cronValidator.isError()) {
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
        {trigger.settings.type === 'HOURS' && (
          <>
            <FormNumberFieldInput
              label="Hours Between Triggers"
              error={
                errorMessagesVisible ? errorMessages.HOURS_hour : undefined
              }
              onBlur={onBlur}
              defaultValue={trigger.settings.schedule.hour}
              onPersist={(newHour) => {
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
              label="Trigger at Minute"
              error={
                errorMessagesVisible ? errorMessages.HOURS_minute : undefined
              }
              onBlur={onBlur}
              defaultValue={trigger.settings.schedule.minute}
              onPersist={(newMinute) => {
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
            label="Minutes Between Triggers"
            error={errorMessagesVisible ? errorMessages.MINUTES : undefined}
            onBlur={onBlur}
            defaultValue={trigger.settings.schedule.minute}
            onPersist={(newMinute) => {
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
