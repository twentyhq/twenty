import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type RecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewSnapshot';
import { getRecordTableWidgetViewForDisplay } from '@/page-layout/widgets/record-table/utils/getRecordTableWidgetViewForDisplay';
import { type View } from '@/views/types/View';
import { isDefined } from 'twenty-shared/utils';

export const getPageLayoutWidgetViewFilterFieldMetadataIds = ({
  widget,
  viewsById,
  recordTableWidgetViewDrafts,
}: {
  widget: Pick<PageLayoutWidget, 'id' | 'configuration'>;
  viewsById: Map<string, View>;
  recordTableWidgetViewDrafts: Record<string, RecordTableWidgetViewSnapshot>;
}): string[] => {
  const viewId =
    'viewId' in widget.configuration ? widget.configuration.viewId : null;

  const view = getRecordTableWidgetViewForDisplay({
    draftSnapshot: recordTableWidgetViewDrafts[widget.id],
    view: isDefined(viewId) ? viewsById.get(viewId) : undefined,
  });

  return (view?.viewFilters ?? []).map(
    ({ fieldMetadataId }) => fieldMetadataId,
  );
};
