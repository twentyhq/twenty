import { type RecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewSnapshot';
import { type View } from '@/views/types/View';

export const constructViewFromRecordTableWidgetViewSnapshot = (
  snapshot: RecordTableWidgetViewSnapshot,
): View => ({
  ...snapshot.view,
  viewFields: snapshot.viewFields,
  viewFilters: [],
  viewSorts: [],
  viewGroups: [],
  viewFilterGroups: [],
});
