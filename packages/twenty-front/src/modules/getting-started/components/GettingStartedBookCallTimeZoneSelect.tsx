import { formatIanaTimeZoneLabel } from '@/getting-started/utils/formatIanaTimeZoneLabel';
import { AVAILABLE_TIMEZONE_OPTIONS } from '@/localization/constants/AvailableTimezoneOptions';
import { findAvailableTimeZoneOption } from '@/localization/utils/findAvailableTimeZoneOption';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { isDefined } from 'twenty-shared/utils';
import { type SelectOption } from 'twenty-ui/primitives/input';

const TIME_ZONE_OPTIONS: SelectOption<string>[] =
  AVAILABLE_TIMEZONE_OPTIONS.map(({ value, label }) => ({
    value: String(value),
    label: formatIanaTimeZoneLabel({ timeZone: String(value) }),
    searchKeywords: label,
  }));

type GettingStartedBookCallTimeZoneSelectProps = {
  timeZone: string;
  onTimeZoneChange: (timeZone: string) => void;
};

export const GettingStartedBookCallTimeZoneSelect = ({
  timeZone,
  onTimeZoneChange,
}: GettingStartedBookCallTimeZoneSelectProps) => {
  const listedTimeZone = findAvailableTimeZoneOption(timeZone)?.value;

  return (
    <Select
      dropdownId="getting-started-book-call-time-zone"
      dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
      selectSizeVariant="small"
      fullWidth
      value={isDefined(listedTimeZone) ? String(listedTimeZone) : timeZone}
      options={TIME_ZONE_OPTIONS}
      pinnedOption={
        isDefined(listedTimeZone)
          ? undefined
          : { value: timeZone, label: formatIanaTimeZoneLabel({ timeZone }) }
      }
      onChange={onTimeZoneChange}
      withSearchInput
    />
  );
};
