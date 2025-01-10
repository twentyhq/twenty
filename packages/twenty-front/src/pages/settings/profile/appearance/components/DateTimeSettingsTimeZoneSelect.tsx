import { detectTimeZone } from '@/localization/utils/detectTimeZone';
import { findAvailableTimeZoneOption } from '@/localization/utils/findAvailableTimeZoneOption';
import { AVAILABLE_TIMEZONE_OPTIONS } from '@/settings/accounts/constants/AvailableTimezoneOptions';
import { Select } from '@/ui/input/components/Select';
import { useTranslation } from 'react-i18next';
import { isDefined } from '~/utils/isDefined';

type DateTimeSettingsTimeZoneSelectProps = {
  value?: string;
  onChange: (nextValue: string) => void;
};

export const DateTimeSettingsTimeZoneSelect = ({
  value = detectTimeZone(),
  onChange,
}: DateTimeSettingsTimeZoneSelectProps) => {
  const systemTimeZone = detectTimeZone();

  const { t } = useTranslation();

  const systemTimeZoneOption = findAvailableTimeZoneOption(systemTimeZone);

  return (
    <Select
      dropdownId="settings-accounts-calendar-time-zone"
      label={t('timezone')}
      dropdownWidthAuto
      fullWidth
      value={value}
      options={[
        {
          label: isDefined(systemTimeZoneOption)
            ? `${t('systemSettings')} - ${systemTimeZoneOption.label}`
            : t('systemSettings'),
          value: 'system',
        },
        ...AVAILABLE_TIMEZONE_OPTIONS,
      ]}
      onChange={onChange}
      withSearchInput
    />
  );
};
