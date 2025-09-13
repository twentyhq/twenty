import { type DateFormat } from '@/localization/constants/DateFormat';
import { type NumberFormat } from '@/localization/constants/NumberFormat';
import { type TimeFormat } from '@/localization/constants/TimeFormat';
import { createContext } from 'react';

export type UserContextType = {
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  timeZone: string;
  numberFormat: NumberFormat;
};

export const UserContext = createContext<UserContextType>(
  {} as UserContextType,
);
