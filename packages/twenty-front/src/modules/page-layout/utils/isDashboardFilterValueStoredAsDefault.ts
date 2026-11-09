import { getDashboardFilterValueToStore } from '@/page-layout/utils/getDashboardFilterValueToStore';
import { isPageLayoutFilterValueEqual } from '@/page-layout/utils/isPageLayoutFilterValueEqual';
import { type PageLayoutFilterValue } from 'twenty-shared/types';

export const isDashboardFilterValueStoredAsDefault = (
  value: PageLayoutFilterValue | null,
  defaultValue: PageLayoutFilterValue | null | undefined,
) =>
  isPageLayoutFilterValueEqual({
    firstValue: getDashboardFilterValueToStore(value),
    secondValue: getDashboardFilterValueToStore(defaultValue ?? null),
  });
