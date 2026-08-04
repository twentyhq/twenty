import { useInitializeRecordTableWidgetViewDraft } from '@/page-layout/widgets/record-table/hooks/useInitializeRecordTableWidgetViewDraft';
import { useViewById } from '@/views/hooks/useViewById';

type RecordTableWidgetViewDraftInitEffectProps = {
  widgetId: string;
  viewId: string;
  isPageLayoutInEditMode: boolean;
  pageLayoutId?: string;
};

// Edit mode and the page layout id are passed in rather than read from context:
// this also mounts from the widget settings side panel, which renders outside
// the page layout tree.
export const RecordTableWidgetViewDraftInitEffect = ({
  widgetId,
  viewId,
  isPageLayoutInEditMode,
  pageLayoutId,
}: RecordTableWidgetViewDraftInitEffectProps) => {
  const { view } = useViewById(viewId);

  useInitializeRecordTableWidgetViewDraft({
    widgetId,
    pageLayoutId,
    view: isPageLayoutInEditMode ? view : undefined,
  });

  return null;
};
