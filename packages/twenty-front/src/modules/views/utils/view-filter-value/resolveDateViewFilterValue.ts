import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
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

const variableDateViewFilterValueDirectionSchema = z.enum([
  'NEXT',
  'THIS',
  'PAST',
]);

export type VariableDateViewFilterValueDirection = z.infer<
  typeof variableDateViewFilterValueDirectionSchema
>;

const variableDateViewFilterValueAmountSchema = z
  .union([z.coerce.number().int().positive(), z.literal('undefined')])
  .transform((val) => (val === 'undefined' ? undefined : val));

export const variableDateViewFilterValueUnitSchema = z.enum([
  'DAY',
  'WEEK',
  'MONTH',
  'YEAR',
]);

export type VariableDateViewFilterValueUnit = z.infer<
  typeof variableDateViewFilterValueUnitSchema
>;

export const variableDateViewFilterValuePartsSchema = z
  .object({
    direction: variableDateViewFilterValueDirectionSchema,
    amount: variableDateViewFilterValueAmountSchema,
    unit: variableDateViewFilterValueUnitSchema,
  })
  .refine((data) => !(data.amount === undefined && data.direction !== 'THIS'), {
    message: "Amount cannot be 'undefined' unless direction is 'THIS'",
  });

const variableDateViewFilterValueSchema = z.string().transform((value) => {
  const [direction, amount, unit] = value.split('_');

  return variableDateViewFilterValuePartsSchema.parse({
    direction,
    amount,
    unit,
  });
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
  amount?: number;
  unit: VariableDateViewFilterValueUnit;
}) => {
  const { direction, amount, unit } = relativeDate;
  const now = roundToNearestMinutes(new Date());

  switch (direction) {
    case 'NEXT':
      if (amount === undefined) throw new Error('Amount is required');
      return {
        start: now,
        end: addUnit(now, amount, unit),
        ...relativeDate,
      };
    case 'PAST':
      if (amount === undefined) throw new Error('Amount is required');
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

export type ResolvedDateViewFilterValue<O extends ViewFilterOperand> =
  O extends ViewFilterOperand.IsRelative
    ? ReturnType<typeof resolveVariableDateViewFilterValue>
    : Date | null;

type PartialViewFilter<O extends ViewFilterOperand> = Pick<
  ViewFilter,
  'value'
> & { operand: O };

export const resolveDateViewFilterValue = <O extends ViewFilterOperand>(
  viewFilter: PartialViewFilter<O>,
): ResolvedDateViewFilterValue<O> => {
  if (!viewFilter.value) return null;

  if (viewFilter.operand === ViewFilterOperand.IsRelative) {
    return resolveVariableDateViewFilterValue(
      viewFilter.value,
    ) as ResolvedDateViewFilterValue<O>;
  }
  return new Date(viewFilter.value) as ResolvedDateViewFilterValue<O>;
};
