import { DATE_PICKER_YEAR_SELECT_OPTIONS_CONFIG } from '@/ui/input/components/internal/date/constants/DatePickerYearSelectOptionsConfig';

export const DATE_PICKER_YEAR_SELECT_OPTIONS = Array.from(
  { length: DATE_PICKER_YEAR_SELECT_OPTIONS_CONFIG.optionCount },
  (_, index) =>
    new Date().getFullYear() +
    DATE_PICKER_YEAR_SELECT_OPTIONS_CONFIG.yearsAfterCurrentYear -
    index,
).map((year) => ({ label: year.toString(), value: year }));
