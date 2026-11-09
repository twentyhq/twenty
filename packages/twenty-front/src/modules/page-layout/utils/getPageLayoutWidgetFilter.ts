import { type DashboardFilterWidgetConfiguration } from '@/page-layout/types/DashboardFilterWidgetConfiguration';
import { type DashboardFilterWidgetFilter } from '@/page-layout/types/DashboardFilterWidgetFilter';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type RecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewSnapshot';
import { getRecordTableWidgetFilter } from '@/page-layout/widgets/record-table/utils/getRecordTableWidgetFilter';
import { getRecordTableWidgetViewForDisplay } from '@/page-layout/widgets/record-table/utils/getRecordTableWidgetViewForDisplay';
import { type View } from '@/views/types/View';
import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export const getPageLayoutWidgetFilter = ({
  widget,
  viewsById,
  recordTableWidgetViewDrafts,
}: {
  widget: Pick<PageLayoutWidget, 'id'> & {
    configuration: DashboardFilterWidgetConfiguration & { viewId?: unknown };
  };
  viewsById: Map<string, View>;
  recordTableWidgetViewDrafts: Record<string, RecordTableWidgetViewSnapshot>;
}): DashboardFilterWidgetFilter => {
  const { filter, viewId } = widget.configuration;

  const view = getRecordTableWidgetViewForDisplay({
    draftSnapshot: recordTableWidgetViewDrafts[widget.id],
    view: isString(viewId) ? viewsById.get(viewId) : undefined,
  });

  if (isDefined(view)) {
    return getRecordTableWidgetFilter(view);
  }

  return {
    recordFilters: filter?.recordFilters ?? [],
    recordFilterGroups: filter?.recordFilterGroups ?? [],
  };
};
