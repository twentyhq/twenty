import { IconCalendarDue } from 'twenty-ui';

import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { Select } from '@/ui/input/components/Select';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';

type MonthAndYearDropdownProps = {
  date: Date;
  onChange?: (newDate: Date) => void;
};

const months = [
  { label: 'January', value: 0 },
  { label: 'February', value: 1 },
  { label: 'March', value: 2 },
  { label: 'April', value: 3 },
  { label: 'May', value: 4 },
  { label: 'June', value: 5 },
  { label: 'July', value: 6 },
  { label: 'August', value: 7 },
  { label: 'September', value: 8 },
  { label: 'October', value: 9 },
  { label: 'November', value: 10 },
  { label: 'December', value: 11 },
];

const years = Array.from(
  { length: 200 },
  (_, i) => new Date().getFullYear() + 5 - i,
).map((year) => ({ label: year.toString(), value: year }));

export const MONTH_AND_YEAR_DROPDOWN_ID = 'date-picker-month-and-year-dropdown';
export const MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID =
  'date-picker-month-and-year-dropdown-month-select';
export const MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID =
  'date-picker-month-and-year-dropdown-year-select';

export const MonthAndYearDropdown = ({
  date,
  onChange,
}: MonthAndYearDropdownProps) => {
  const handleChangeMonth = (month: number) => {
    const newDate = new Date(date);
    newDate.setMonth(month);
    onChange?.(newDate);
  };

  const handleChangeYear = (year: number) => {
    const newDate = new Date(date);
    newDate.setFullYear(year);
    onChange?.(newDate);
  };

  return (
    <Dropdown
      dropdownId={MONTH_AND_YEAR_DROPDOWN_ID}
      dropdownHotkeyScope={{
        scope: TableHotkeyScope.CellEditMode,
      }}
      dropdownPlacement="bottom-start"
      clickableComponent={
        <LightIconButton Icon={IconCalendarDue} size="medium" />
      }
      dropdownComponents={
        <DropdownMenuItemsContainer>
          <Select
            dropdownId={MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID}
            options={months}
            fullWidth
            disableBlur
            onChange={handleChangeMonth}
            value={date.getMonth()}
          />
          <Select
            dropdownId={MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID}
            onChange={handleChangeYear}
            value={date.getFullYear()}
            options={years}
            fullWidth
            disableBlur
          />
        </DropdownMenuItemsContainer>
      }
    />
  );
};
