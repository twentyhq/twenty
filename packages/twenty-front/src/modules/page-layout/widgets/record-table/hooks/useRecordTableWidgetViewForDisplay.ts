import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { constructViewFromRecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/utils/constructViewFromRecordTableWidgetViewSnapshot';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useViewById } from '@/views/hooks/useViewById';
import { type View } from '@/views/types/View';
import { isDefined } from 'twenty-shared/utils';

type UseRecordTableWidgetViewForDisplayParams = {
  viewId: string;
  widgetId: string;
  pageLayoutId: string;
};

export const useRecordTableWidgetViewForDisplay = ({
  viewId,
  widgetId,
  pageLayoutId,
}: UseRecordTableWidgetViewForDisplayParams): {
  view: View | undefined;
} => {
  const { view } = useViewById(viewId);

  const recordTableWidgetViewDraft = useAtomComponentStateValue(
    recordTableWidgetViewDraftComponentState,
    pageLayoutId,
  );

  const draftSnapshot = recordTableWidgetViewDraft[widgetId];

  const viewFromDraft = isDefined(draftSnapshot)
    ? constructViewFromRecordTableWidgetViewSnapshot(draftSnapshot)
    : undefined;

  return { view: viewFromDraft ?? view };
};
