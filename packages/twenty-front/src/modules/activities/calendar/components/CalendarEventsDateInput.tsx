import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { formatPlainDateISOString } from '@/localization/utils/formatPlainDateISOString';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { DatePicker } from '@/ui/input/components/internal/date/components/DatePicker';
import { DATE_PICKER_CONTAINER_WIDTH } from '@/ui/input/components/internal/date/components/StyledDatePickerContainer';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { IconCalendar } from 'twenty-ui/icon';
import { dateLocaleState } from '~/localization/states/dateLocaleState';

type CalendarEventsDateInputProps = {
  dropdownId: string;
  plainDate: string | undefined;
  placeholder: string;
  onChange: (plainDate: string | undefined) => void;
};

export const CalendarEventsDateInput = ({
  dropdownId,
  plainDate,
  placeholder,
  onChange,
}: CalendarEventsDateInputProps) => {
  const { dateFormat } = useDateTimeFormat();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);
  const { closeDropdown } = useCloseDropdown();

  const handleChange = (newPlainDate: string | null) => {
    onChange(newPlainDate ?? undefined);
  };

  const handleClose = () => {
    closeDropdown(dropdownId);
  };

  const handleClear = () => {
    onChange(undefined);
    closeDropdown(dropdownId);
  };

  const label = isDefined(plainDate)
    ? formatPlainDateISOString({ date: plainDate, dateFormat, localeCatalog })
    : placeholder;

  return (
    <Dropdown
      dropdownId={dropdownId}
      clickableComponent={
        <SelectControl
          selectedOption={{
            label,
            value: plainDate ?? null,
            Icon: IconCalendar,
          }}
          selectSizeVariant="small"
          textAccent={isDefined(plainDate) ? 'default' : 'placeholder'}
        />
      }
      dropdownComponents={
        <LegacyDropdownContent widthInPixels={DATE_PICKER_CONTAINER_WIDTH}>
          <DatePicker
            instanceId={dropdownId}
            plainDateString={plainDate ?? null}
            onChange={handleChange}
            onClose={handleClose}
            onClear={handleClear}
            clearable
          />
        </LegacyDropdownContent>
      }
    />
  );
};
