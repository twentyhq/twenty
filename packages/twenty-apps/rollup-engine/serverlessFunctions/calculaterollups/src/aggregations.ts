import { applyFilters, getNestedValue, toComparableNumber } from './filtering';
import type { ChildRecord, RollupDefinition } from './types';

const roundForSum = (value: number) =>
  Number.isInteger(value) ? value : Math.round(value * 100) / 100;

export const computeAggregations = (
  definition: RollupDefinition,
  records: ChildRecord[],
  now: Date,
) => {
  const baseFiltered = applyFilters(records, definition.childFilters, now);
  const result: Record<string, number | string | null | Record<string, unknown>> = {};

  definition.aggregations.forEach((aggregation) => {
    const scopedRecords = applyFilters(baseFiltered, aggregation.filters, now);

    switch (aggregation.type) {
      case 'COUNT':
        result[aggregation.parentField] = scopedRecords.length;
        break;
      case 'SUM': {
        if (!aggregation.childField) {
          throw new Error('SUM aggregation requires childField');
        }
        const total = scopedRecords.reduce(
          (accumulator, record) => {
            const rawValue = getNestedValue(record, aggregation.childField!);
            const currencyRaw =
              aggregation.currencyField !== undefined
                ? getNestedValue(record, aggregation.currencyField)
                : undefined;
            const numeric =
              typeof rawValue === 'number'
                ? rawValue
                : typeof rawValue === 'string'
                  ? Number(rawValue)
                  : NaN;
            if (Number.isNaN(numeric)) {
              return accumulator;
            }
            return {
              amount: accumulator.amount + numeric,
              currency:
                typeof currencyRaw === 'string' && currencyRaw.trim().length > 0
                  ? currencyRaw
                  : accumulator.currency,
            };
          },
          { amount: 0, currency: undefined as string | undefined },
        );
        result[aggregation.parentField] = {
          amountMicros: Math.round(roundForSum(total.amount)),
          currencyCode: total.currency ?? '',
        };
        break;
      }
      case 'AVG': {
        if (!aggregation.childField) {
          throw new Error('AVG aggregation requires childField');
        }
        const { total, count } = scopedRecords.reduce(
          (accumulator, record) => {
            const rawValue = getNestedValue(record, aggregation.childField!);
            const numeric =
              typeof rawValue === 'number'
                ? rawValue
                : typeof rawValue === 'string'
                  ? Number(rawValue)
                  : NaN;
            if (Number.isNaN(numeric)) {
              return accumulator;
            }
            return {
              total: accumulator.total + numeric,
              count: accumulator.count + 1,
            };
          },
          { total: 0, count: 0 },
        );
        result[aggregation.parentField] = count === 0 ? null : roundForSum(total / count);
        break;
      }
      case 'MAX':
      case 'MIN': {
        if (!aggregation.childField) {
          throw new Error(`${aggregation.type} aggregation requires childField`);
        }
        const direction = aggregation.type === 'MAX' ? 1 : -1;
        let chosen: { raw: unknown; comparable: number | null } | null = null;
        scopedRecords.forEach((record) => {
          const rawValue = getNestedValue(record, aggregation.childField!);
          const comparable = toComparableNumber(rawValue);
          if (comparable === null) {
            return;
          }
          if (
            chosen === null ||
            (chosen.comparable !== null && direction * (comparable - chosen.comparable) > 0)
          ) {
            chosen = { raw: rawValue, comparable };
          }
        });

        if (chosen === null) {
          result[aggregation.parentField] = null;
        } else if (typeof chosen.raw === 'number') {
          result[aggregation.parentField] = chosen.raw;
        } else if (chosen.raw instanceof Date) {
          result[aggregation.parentField] = chosen.raw.toISOString().slice(0, 10);
        } else if (chosen.raw === null || chosen.raw === undefined) {
          result[aggregation.parentField] = null;
        } else {
          const rawString = String(chosen.raw);
          const parsed = Date.parse(rawString);
          result[aggregation.parentField] = Number.isNaN(parsed)
            ? rawString
            : new Date(parsed).toISOString().slice(0, 10);
        }
        break;
      }
      default:
        break;
    }
  });

  return result;
};
