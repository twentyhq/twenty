import { type WidgetDashboardFilterHeaderContent } from '@/page-layout/types/WidgetDashboardFilterHeaderContent';
import { isNonEmptyArray } from 'twenty-shared/utils';

// The unavailable-field status is a warning, so it keeps its text
export const hasWidgetDashboardFilterHeaderCollapsibleItem = ({
  fieldLabels,
  pills,
}: Pick<WidgetDashboardFilterHeaderContent, 'fieldLabels' | 'pills'>) =>
  isNonEmptyArray(fieldLabels) ||
  pills.some(({ kind }) => kind !== 'UNAVAILABLE');
