import { CalendarSystem } from '@/localization/constants/CalendarSystem';
import { DATE_TIME_SETTINGS_PREVIEW_DATE } from '@/localization/constants/DateTimeSettingsPreviewDate';
import { detectCalendarSystem } from '@/localization/utils/detection/detectCalendarSystem';
import { Select } from '@/ui/input/components/Select';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { dateLocaleState } from '~/localization/states/dateLocaleState';

type DateTimeSettingsCalendarSystemSelectProps = {
  value: CalendarSystem;
  onChange: (nextValue: CalendarSystem) => void;
};

export const DateTimeSettingsCalendarSystemSelect = ({
  value,
  onChange,
}: DateTimeSettingsCalendarSystemSelectProps) => {
  const { t } = useLingui();
  const dateLocale = useAtomStateValue(dateLocaleState);

  const getCalendarSystemPreview = (calendarSystem: CalendarSystem) =>
    new Intl.DateTimeFormat(dateLocale.localeCatalog.code, {
      calendar: calendarSystem,
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(DATE_TIME_SETTINGS_PREVIEW_DATE);

  return (
    <Select
      dropdownId="datetime-settings-calendar-system"
      dropdownWidth={320}
      label={t`Calendar system`}
      fullWidth
      value={value}
      pinnedOption={{
        label: t`System settings`,
        value: CalendarSystem.SYSTEM,
        contextualText: getCalendarSystemPreview(
          CalendarSystem[detectCalendarSystem()],
        ),
      }}
      options={[
        {
          label: t`Gregorian`,
          value: CalendarSystem.GREGORIAN,
          contextualText: getCalendarSystemPreview(CalendarSystem.GREGORIAN),
        },
        {
          label: t`Persian (Jalali)`,
          value: CalendarSystem.PERSIAN,
          contextualText: getCalendarSystemPreview(CalendarSystem.PERSIAN),
        },
        {
          label: t`Islamic (Hijri)`,
          value: CalendarSystem.ISLAMIC,
          contextualText: getCalendarSystemPreview(CalendarSystem.ISLAMIC),
        },
      ]}
      onChange={onChange}
    />
  );
};
