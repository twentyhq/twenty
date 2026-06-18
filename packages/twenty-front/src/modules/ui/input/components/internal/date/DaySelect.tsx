import { useMemo } from 'react';

import { SELECT_DAY_DROPDOWN_ID } from '@/ui/input/components/internal/date/constants/SelectDayDropdownId';
import { type DayNameWithIndex } from '@/ui/input/components/internal/date/types/DayNameWithIndex';
import { Select } from '@/ui/input/components/Select';
import { type SelectOption } from 'twenty-ui/input';

export const DaySelect = ({
  label,
  selectedDayIndex,
  onChange,
  dayList,
}: {
  label: string;
  selectedDayIndex: number;
  onChange: (dayIndex: number | string) => void;
  dayList: DayNameWithIndex[];
}) => {
  const options: SelectOption<string | number>[] = useMemo(() => {
    const days = dayList?.map<SelectOption<string | number>>(
      ({ day, index }) => ({
        label: day,
        value: index,
      }),
    );

    return days;
  }, [dayList]);

  return (
    <Select
      fullWidth
      dropdownId={SELECT_DAY_DROPDOWN_ID}
      options={options}
      label={label}
      onChange={onChange}
      value={selectedDayIndex}
      dropdownWidth={218}
      dropdownWidthAuto
    />
  );
};
