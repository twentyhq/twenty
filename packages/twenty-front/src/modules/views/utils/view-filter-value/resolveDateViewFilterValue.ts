import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewFilterValueType } from '@/views/types/ViewFilterValueType';
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  roundToNearestMinutes,
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

export const variableDateViewFilterValueDirectionSchema = z.enum([
  'NEXT',
  'THIS',
  'PAST',
]);

export type VariableDateViewFilterValueDirection = z.infer<
  typeof variableDateViewFilterValueDirectionSchema
>;

export const variableDateViewFilterValueAmountSchema = z
  .number()
  .int()
  .positive();

export const variableDateViewFilterValueUnitSchema = z.enum([
  'DAY',
  'WEEK',
  'MONTH',
  'YEAR',
]);

export type VariableDateViewFilterValueUnit = z.infer<
  typeof variableDateViewFilterValueUnitSchema
>;

const variableDateViewFilterValueSchema = z.string().transform((value) => {
  const [direction, amountStr, unit] = value.split('_');
  const amount = parseInt(amountStr);
  return z
    .object({
      direction: variableDateViewFilterValueDirectionSchema,
      amount: variableDateViewFilterValueAmountSchema,
      unit: variableDateViewFilterValueUnitSchema,
    })
    .parse({ direction, amount, unit });
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

const resolveVariableDateViewFilterValueFromRelativeDate = (relativeDate: {
  direction: VariableDateViewFilterValueDirection;
  amount: number;
  unit: VariableDateViewFilterValueUnit;
}) => {
  const { direction, amount, unit } = relativeDate;
  const now = roundToNearestMinutes(new Date());

  switch (direction) {
    case 'NEXT':
      return {
        start: now,
        end: addUnit(now, amount, unit),
        ...relativeDate,
      };
    case 'PAST':
      return {
        start: subUnit(now, amount, unit),
        end: now,
        ...relativeDate,
      };
    case 'THIS':
      return {
        start: startOfUnit(now, unit),
        end: endOfUnit(now, unit),
        ...relativeDate,
      };
  }
};

const resolveVariableDateViewFilterValue = (value?: string | null) => {
  if (!value) return null;

  const relativeDate = variableDateViewFilterValueSchema.parse(value);
  return resolveVariableDateViewFilterValueFromRelativeDate(relativeDate);
};

export type ResolvedDateViewFilterValue<T extends ViewFilterValueType> =
  T extends ViewFilterValueType.VARIABLE
    ? ReturnType<typeof resolveVariableDateViewFilterValue>
    : Date | null;

type PartialViewFilter<T extends ViewFilterValueType> = Pick<
  ViewFilter,
  'value' | 'valueType'
> & { valueType: T };

export const resolveDateViewFilterValue = <T extends ViewFilterValueType>(
  viewFilter: PartialViewFilter<T>,
): ResolvedDateViewFilterValue<T> => {
  if (!viewFilter.value) return null;

  if (viewFilter.valueType === ViewFilterValueType.VARIABLE) {
    return resolveVariableDateViewFilterValue(
      viewFilter.value,
    ) as ResolvedDateViewFilterValue<T>;
  }
  return new Date(viewFilter.value) as ResolvedDateViewFilterValue<T>;
};
