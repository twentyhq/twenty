import { DASHBOARD_DATE_RANGE_FILTER_ID } from '@/page-layout/constants/DashboardDateRangeFilterId';
import { t } from '@lingui/core/macro';
import { type PageLayoutFilter } from '~/generated-metadata/graphql';

export const getPageLayoutFilterDisplayLabel = (
  pageLayoutFilter: Pick<PageLayoutFilter, 'id' | 'label'>,
): string =>
  pageLayoutFilter.id === DASHBOARD_DATE_RANGE_FILTER_ID
    ? t`Date range`
    : pageLayoutFilter.label;
