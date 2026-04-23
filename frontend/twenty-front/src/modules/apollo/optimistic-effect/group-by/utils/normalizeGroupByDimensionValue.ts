import { isDefined } from 'twenty-shared/utils';

export const normalizeGroupByDimensionValue = (
  value: any,
  fieldConfig: boolean | Record<string, string> | undefined,
): string => {
  if (typeof fieldConfig === 'object' && isDefined(fieldConfig.granularity)) {
    const dateValue = new Date(value);
    const granularity = fieldConfig.granularity;

    // TODO: to remove once backend properly returns DATE without time
    switch (granularity) {
      case 'DAY':
        return dateValue.toISOString().split('T')[0];
      case 'MONTH':
        return dateValue.toISOString().substring(0, 7);
      case 'YEAR':
        return dateValue.getFullYear().toString();
      case 'DAY_OF_THE_WEEK':
        return dateValue.getDay().toString();
      case 'MONTH_OF_THE_YEAR':
        return (dateValue.getMonth() + 1).toString();
      default:
        return String(value);
    }
  }

  if (typeof value === 'object' && value !== null) {
    return value.id ? String(value.id) : JSON.stringify(value);
  }

  return String(value);
};
