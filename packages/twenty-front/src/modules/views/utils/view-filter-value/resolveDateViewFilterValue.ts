import { ViewFilter } from '@/views/types/ViewFilter';
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from 'date-fns';

import { z } from 'zod';

const variableDateViewFilterValueDirectionSchema = z.enum([
  'NEXT',
  'THIS',
  'PAST',
]);

export type VariableDateViewFilterValueDirection = z.infer<
  typeof variableDateViewFilterValueDirectionSchema
>;

const variableDateViewFilterValueUnitSchema = z.enum([
  'DAY',
  'WEEK',
  'MONTH',
  'YEAR',
]);

export type VariableDateViewFilterValueUnit = z.infer<
  typeof variableDateViewFilterValueUnitSchema
>;

const variableDateViewFilterValueSchema = z.string().transform((value) => {
  const [direction, amount, unit] = value.split('_');
  return z
    .tuple([
      variableDateViewFilterValueDirectionSchema,
      z.number().int().positive(),
      variableDateViewFilterValueUnitSchema,
    ])
    .parse([direction, parseInt(amount), unit]);
});

const addUnit = (
  date: Date,
  amount: number,
  unit: VariableDateViewFilterValueUnit,
) => {
  switch (unit) {
    case 'DAY':
      return addDays(date, amount);
    case 'WEEK':
      return addWeeks(date, amount);
    case 'MONTH':
      return addMonths(date, amount);
    case 'YEAR':
      return addYears(date, amount);
  }
};

const subUnit = (
  date: Date,
  amount: number,
  unit: VariableDateViewFilterValueUnit,
) => {
  switch (unit) {
    case 'DAY':
      return subDays(date, amount);
    case 'WEEK':
      return subWeeks(date, amount);
    case 'MONTH':
      return subMonths(date, amount);
    case 'YEAR':
      return subYears(date, amount);
  }
};

const startOfUnit = (date: Date, unit: VariableDateViewFilterValueUnit) => {
  switch (unit) {
    case 'DAY':
      return startOfDay(date);
    case 'WEEK':
      return startOfWeek(date);
    case 'MONTH':
      return startOfMonth(date);
    case 'YEAR':
      return startOfYear(date);
  }
};

const endOfUnit = (date: Date, unit: VariableDateViewFilterValueUnit) => {
  switch (unit) {
    case 'DAY':
      return endOfDay(date);
    case 'WEEK':
      return endOfWeek(date);
    case 'MONTH':
      return endOfMonth(date);
    case 'YEAR':
      return endOfYear(date);
  }
};

const resolveVariableDateViewFilterValue = (value: string) => {
  const [direction, amount, unit] =
    variableDateViewFilterValueSchema.parse(value);
  const now = new Date();

  switch (direction) {
    case 'NEXT':
      return {
        start: now,
        end: addUnit(now, amount, unit),
      };
    case 'PAST':
      return {
        start: subUnit(now, amount, unit),
        end: now,
      };
    case 'THIS':
      return {
        start: startOfUnit(now, unit),
        end: endOfUnit(now, unit),
      };
  }
};

export const resolveDateViewFilterValue = (
  viewFilter: Pick<ViewFilter, 'value' | 'valueType'>,
) => {
  if (!viewFilter.value) return null;

  if (viewFilter.valueType === 'VARIABLE') {
    return resolveVariableDateViewFilterValue(viewFilter.value);
  }
  return new Date(viewFilter.value);
};
