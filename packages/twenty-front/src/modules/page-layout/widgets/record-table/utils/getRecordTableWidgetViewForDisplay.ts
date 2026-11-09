import { type RecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewSnapshot';
import { constructViewFromRecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/utils/constructViewFromRecordTableWidgetViewSnapshot';
import { type View } from '@/views/types/View';
import { isDefined } from 'twenty-shared/utils';

export const getRecordTableWidgetViewForDisplay = ({
  draftSnapshot,
  view,
}: {
  draftSnapshot: RecordTableWidgetViewSnapshot | undefined;
  view: View | undefined;
}): View | undefined =>
  isDefined(draftSnapshot)
    ? constructViewFromRecordTableWidgetViewSnapshot(draftSnapshot)
    : view;
