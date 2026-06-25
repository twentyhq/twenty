import { RELATIVE_DATE_UNITS_SELECT_OPTIONS } from '@/ui/input/components/internal/date/constants/RelativeDateUnitSelectOptions';
import { type RelativeDateFilterUnit } from 'twenty-shared/utils';

type RelativeDateUnitOption = {
  value: RelativeDateFilterUnit;
  label: string;
};

// Units are ordered ascending (Second → Year) so the dropdown reads naturally.
// DAY stays the default selection; only the list order changes here.
export const RELATIVE_DATETIME_UNITS_SELECT_OPTIONS: RelativeDateUnitOption[] =
  [
    { value: 'SECOND', label: 'Second' },
    { value: 'MINUTE', label: 'Minute' },
    { value: 'HOUR', label: 'Hour' },
    ...RELATIVE_DATE_UNITS_SELECT_OPTIONS,
  ];
