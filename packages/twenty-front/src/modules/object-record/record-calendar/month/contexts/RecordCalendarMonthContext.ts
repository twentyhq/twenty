import { createRequiredContext } from '~/utils/createRequiredContext';

type RecordCalendarMonthContextValue = {
  firstDayOfMonth: Date;
  lastDayOfMonth: Date;
  firstDayOfFirstWeek: Date;
  lastDayOfLastWeek: Date;
  weekDayLabels: string[];
  weekFirstDays: Date[];
  weekStartsOnDayIndex: 0 | 1 | 2 | 3 | 4 | 5 | 6;
};

export const [
  RecordCalendarMonthContextProvider,
  useRecordCalendarMonthContextOrThrow,
] = createRequiredContext<RecordCalendarMonthContextValue>(
  'RecordCalendarMonthContext',
);
