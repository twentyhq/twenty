import { type CalendarSystem } from '@/localization/constants/CalendarSystem';
import { type DateFormat } from '@/localization/constants/DateFormat';
import { type TimeFormat } from '@/localization/constants/TimeFormat';
import { createContext } from 'react';

export type UserContextType = {
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  timeZone: string;
  calendarSystem: CalendarSystem;
};

export const UserContext = createContext<UserContextType>(
  {} as UserContextType,
);
