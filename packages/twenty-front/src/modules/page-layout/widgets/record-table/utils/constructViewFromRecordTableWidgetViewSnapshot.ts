import { type RecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewSnapshot';
import { getRecordTableWidgetDraftViewFieldClientId } from '@/page-layout/widgets/record-table/utils/getRecordTableWidgetDraftViewFieldClientId';
import { type View } from '@/views/types/View';

export const constructViewFromRecordTableWidgetViewSnapshot = (
  snapshot: RecordTableWidgetViewSnapshot,
): View => ({
  ...snapshot.view,
  viewFields: snapshot.viewFields.map((draftField) => {
    const { clientRecordFieldId: _clientRecordFieldId, ...fieldRest } =
      draftField;

    return {
      ...fieldRest,
      id: getRecordTableWidgetDraftViewFieldClientId(draftField),
    };
  }),
  viewFilters: snapshot.viewFilters,
  viewFilterGroups: snapshot.viewFilterGroups,
  viewSorts: snapshot.viewSorts,
  viewGroups: [],
});
