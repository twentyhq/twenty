import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getWidgetConfigurationViewId } from '@/page-layout/utils/getWidgetConfigurationViewId';
import { type RecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewSnapshot';
import { buildRecordTableWidgetViewSnapshotFromView } from '@/page-layout/widgets/record-table/utils/buildRecordTableWidgetViewSnapshotFromView';
import { type View } from '@/views/types/View';
import { isDefined } from 'twenty-shared/utils';

type BuildMissingRecordTableWidgetViewDraftSnapshotsParams = {
  widgets: PageLayoutWidget[];
  existingSnapshotsByWidgetId: Record<string, RecordTableWidgetViewSnapshot>;
  views: View[];
};

export const buildMissingRecordTableWidgetViewDraftSnapshots = ({
  widgets,
  existingSnapshotsByWidgetId,
  views,
}: BuildMissingRecordTableWidgetViewDraftSnapshotsParams): Record<
  string,
  RecordTableWidgetViewSnapshot
> => {
  const missingSnapshotsByWidgetId: Record<
    string,
    RecordTableWidgetViewSnapshot
  > = {};

  for (const widget of widgets) {
    if (widget.id in existingSnapshotsByWidgetId) {
      continue;
    }

    const viewId = getWidgetConfigurationViewId(widget.configuration);

    if (!isDefined(viewId)) {
      continue;
    }

    const view = views.find((viewToFind) => viewToFind.id === viewId);

    // A view without fields has not finished being created server-side;
    // snapshotting it now would lock an empty column set into the draft.
    if (!isDefined(view) || view.viewFields.length === 0) {
      continue;
    }

    missingSnapshotsByWidgetId[widget.id] =
      buildRecordTableWidgetViewSnapshotFromView(view);
  }

  return missingSnapshotsByWidgetId;
};
