import { RELATIVE_DATE_UNITS_SELECT_OPTIONS } from '@/ui/input/components/internal/date/constants/RelativeDateUnitSelectOptions';
import { type RelativeDateFilterUnit } from 'twenty-shared/utils';

type RelativeDateUnitOption = {
  value: RelativeDateFilterUnit;
  label: string;
};

export const RELATIVE_DATETIME_UNITS_SELECT_OPTIONS: RelativeDateUnitOption[] =
  [
    ...RELATIVE_DATE_UNITS_SELECT_OPTIONS,
    { value: 'HOUR', label: 'Hour' },
    { value: 'MINUTE', label: 'Minute' },
    { value: 'SECOND', label: 'Second' },
  ];
