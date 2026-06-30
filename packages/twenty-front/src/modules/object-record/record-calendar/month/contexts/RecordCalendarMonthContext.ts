import { type Temporal } from 'temporal-polyfill';
import { createRequiredContext } from '~/utils/createRequiredContext';

type RecordCalendarMonthContextValue = {
  firstDayOfMonth: Temporal.PlainDate;
  lastDayOfMonth: Temporal.PlainDate;
  firstDayOfFirstWeek: Temporal.PlainDate;
  lastDayOfLastWeek: Temporal.PlainDate;
  weekDayLabels: string[];
  weekFirstDays: Temporal.PlainDate[];
  weekStartsOnDayIndex: 0 | 1 | 2 | 3 | 4 | 5 | 6;
};

export const [
  RecordCalendarMonthContextProvider,
  useRecordCalendarMonthContextOrThrow,
] = createRequiredContext<RecordCalendarMonthContextValue>(
  'RecordCalendarMonthContext',
);
