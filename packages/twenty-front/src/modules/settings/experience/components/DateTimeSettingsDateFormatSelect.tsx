import { type CalendarSystem } from '@/localization/constants/CalendarSystem';
import { DateFormat } from '@/localization/constants/DateFormat';
import { DATE_TIME_SETTINGS_PREVIEW_DATE } from '@/localization/constants/DateTimeSettingsPreviewDate';
import { detectDateFormat } from '@/localization/utils/detection/detectDateFormat';
import { detectTimeZone } from '@/localization/utils/detection/detectTimeZone';
import { formatInstantInTimeZone } from '@/localization/utils/formatInstantInTimeZone';
import { Select } from '@/ui/input/components/Select';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { dateLocaleState } from '~/localization/states/dateLocaleState';

type DateTimeSettingsDateFormatSelectProps = {
  value: DateFormat;
  onChange: (nextValue: DateFormat) => void;
  timeZone: string;
  calendarSystem: CalendarSystem;
};

export const DateTimeSettingsDateFormatSelect = ({
  onChange,
  timeZone,
  calendarSystem,
  value,
}: DateTimeSettingsDateFormatSelectProps) => {
  const { t } = useLingui();
  const dateLocale = useAtomStateValue(dateLocaleState);

  const systemTimeZone = detectTimeZone();

  const usedTimeZone = timeZone === 'system' ? systemTimeZone : timeZone;

  const systemDateFormat = DateFormat[detectDateFormat()];

  const formatPreviewDate = (dateFormat: DateFormat) =>
    formatInstantInTimeZone({
      date: DATE_TIME_SETTINGS_PREVIEW_DATE,
      timeZone: usedTimeZone,
      dateFormat,
      calendarSystem,
      localeCatalog: dateLocale.localeCatalog,
    });

  return (
    <Select
      dropdownId="datetime-settings-date-format"
      dropdownWidth={320}
      label={t`Date format`}
      fullWidth
      value={value}
      pinnedOption={{
        label: t`System settings`,
        value: DateFormat.SYSTEM,
        contextualText: formatPreviewDate(systemDateFormat),
      }}
      options={[
        {
          label: formatPreviewDate(DateFormat.MONTH_FIRST),
          value: DateFormat.MONTH_FIRST,
        },
        {
          label: formatPreviewDate(DateFormat.DAY_FIRST),
          value: DateFormat.DAY_FIRST,
        },
        {
          label: formatPreviewDate(DateFormat.YEAR_FIRST),
          value: DateFormat.YEAR_FIRST,
        },
      ]}
      onChange={onChange}
    />
  );
};
