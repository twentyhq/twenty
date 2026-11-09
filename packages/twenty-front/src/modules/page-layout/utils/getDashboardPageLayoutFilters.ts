import { DASHBOARD_PERIOD_FILTER_ID } from '@/page-layout/constants/DashboardPeriodFilterId';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isNonEmptyArray } from 'twenty-shared/utils';
import {
  type PageLayoutFilter,
  PageLayoutFilterType,
} from '~/generated-metadata/graphql';

export const getDashboardPageLayoutFilters = (
  filters: PageLayoutFilter[] | null | undefined,
): PageLayoutFilter[] => {
  if (isNonEmptyArray(filters)) {
    return [...filters].sort(
      (firstFilter, secondFilter) =>
        firstFilter.position - secondFilter.position,
    );
  }

  return [
    {
      id: DASHBOARD_PERIOD_FILTER_ID,
      // Stored as is; getPageLayoutFilterDisplayLabel translates it
      label: doNotTranslate('Period'),
      type: PageLayoutFilterType.DATE,
      position: 0,
      defaultValue: null,
    },
  ];
};
