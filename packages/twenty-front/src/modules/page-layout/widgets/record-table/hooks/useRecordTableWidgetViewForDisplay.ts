import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { getRecordTableWidgetViewForDisplay } from '@/page-layout/widgets/record-table/utils/getRecordTableWidgetViewForDisplay';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useViewById } from '@/views/hooks/useViewById';
import { type View } from '@/views/types/View';

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

  return {
    view: getRecordTableWidgetViewForDisplay({
      draftSnapshot: recordTableWidgetViewDraft[widgetId],
      view,
    }),
  };
};
