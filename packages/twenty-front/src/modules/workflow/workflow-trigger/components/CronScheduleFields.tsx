import { CRON_SCHEDULE_NUMERIC_FIELDS } from '@/workflow/workflow-trigger/constants/CronScheduleNumericFields';
import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useId } from 'react';
import { Field } from 'twenty-ui/primitives/input';
import { InputHint } from '@/ui/input/components/internal/InputHint/InputHint';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { CRON_TRIGGER_INTERVAL_OPTIONS } from '@/workflow/workflow-trigger/constants/CronTriggerIntervalOptions';
import { type CronScheduleDraft } from '@/workflow/workflow-trigger/types/CronScheduleDraft';
import { convertScheduleToCronExpression } from '@/workflow/workflow-trigger/utils/convertScheduleToCronExpression';
import { getCronScheduleDraftFromSettings } from '@/workflow/workflow-trigger/utils/getCronScheduleDraftFromSettings';
import { getCronScheduleDraftResult } from '@/workflow/workflow-trigger/utils/getCronScheduleDraftResult';
import { getCronTriggerDefaultSettings } from '@/workflow/workflow-trigger/utils/getCronTriggerDefaultSettings';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { describeCronExpression } from '~/utils/cron-to-human/describeCronExpression';

type CronScheduleFieldsProps = {
  value: CronScheduleDraft;
  onChange: (update: (current: CronScheduleDraft) => CronScheduleDraft) => void;
  readonly?: boolean;
  isDescriptionVisible?: boolean;
};
export const CronScheduleFields = ({
  value,
  onChange,
  readonly = false,
  isDescriptionVisible = true,
}: CronScheduleFieldsProps) => {
  const { t } = useLingui();
  const instanceId = useId();
  const dateLocale = useAtomStateValue(dateLocaleState);
  const result = getCronScheduleDraftResult(value);
  const pattern = isDefined(result.settings)
    ? convertScheduleToCronExpression({ settings: result.settings })
    : undefined;
  const description = (() => {
    if (!isDefined(pattern)) {
      return undefined;
    }
    try {
      return describeCronExpression(
        pattern,
        { use24HourTimeFormat: true },
        dateLocale.localeCatalog,
      );
    } catch {
      return undefined;
    }
  })();
  const fields = CRON_SCHEDULE_NUMERIC_FIELDS[value.interval];
  const updateDraft = (
    update: (current: CronScheduleDraft) => CronScheduleDraft,
  ) => {
    if (readonly) {
      return;
    }
    onChange(update);
  };

  return (
    <>
      <FormFieldInputContainer>
        <Select
          label={t`Trigger interval`}
          dropdownId={`${instanceId}-interval`}
          value={value.interval}
          options={CRON_TRIGGER_INTERVAL_OPTIONS.map((option) => ({
            ...option,
            label: t(option.label),
          }))}
          disabled={readonly}
          fullWidth
          renderAsTag
          onChange={(selected) => {
            const interval = CRON_TRIGGER_INTERVAL_OPTIONS.find(
              (option) => option.value === selected,
            )?.value;
            if (!isDefined(interval)) {
              return;
            }
            updateDraft(() =>
              getCronScheduleDraftFromSettings(
                getCronTriggerDefaultSettings(interval),
              ),
            );
          }}
        />
        <Field.Description>{t`Schedules use UTC time.`}</Field.Description>
      </FormFieldInputContainer>
      {value.interval === 'CUSTOM' && (
        <SettingsTextInput
          instanceId={`${instanceId}-pattern`}
          label={t`Expression`}
          placeholder="0 9 * * 1"
          value={value.pattern}
          disabled={readonly}
          error={result.errors.pattern}
          hint={description}
          onChange={(pattern) =>
            updateDraft((current) => ({ ...current, pattern }))
          }
        />
      )}
      {fields.map(({ key, label, placeholder }) => (
        <SettingsTextInput
          key={`${value.interval}-${key}`}
          instanceId={`${instanceId}-${key}`}
          label={t(label)}
          placeholder={t(placeholder)}
          value={value[key]}
          disabled={readonly}
          error={result.errors[key]}
          inputMode="numeric"
          onChange={(input) =>
            updateDraft((current) => ({ ...current, [key]: input }))
          }
        />
      ))}
      {isDefined(result.errors.interval) && (
        <InputHint danger>{result.errors.interval}</InputHint>
      )}
      {isDescriptionVisible &&
        value.interval !== 'CUSTOM' &&
        isDefined(description) && <InputHint>{description}</InputHint>}
    </>
  );
};
