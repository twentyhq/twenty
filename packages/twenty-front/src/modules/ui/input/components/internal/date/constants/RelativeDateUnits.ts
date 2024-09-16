import { RelativeDateUnit } from '../types/RelativeDateUnit';

export const RELATIVE_DATE_UNITS: { value: RelativeDateUnit; label: string }[] =
  [
    { value: RelativeDateUnit.Day, label: 'Day' },
    { value: RelativeDateUnit.Week, label: 'Week' },
    { value: RelativeDateUnit.Month, label: 'Month' },
    { value: RelativeDateUnit.Year, label: 'Year' },
  ];
