import { DASHBOARD_PERIOD_FILTER_ID } from '@/page-layout/constants/DashboardPeriodFilterId';
import { t } from '@lingui/core/macro';
import { type PageLayoutFilter } from '~/generated-metadata/graphql';

export const getPageLayoutFilterDisplayLabel = (
  pageLayoutFilter: Pick<PageLayoutFilter, 'id' | 'label'>,
): string =>
  pageLayoutFilter.id === DASHBOARD_PERIOD_FILTER_ID
    ? t`Period`
    : pageLayoutFilter.label;
