import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { useInitializeRecordTableWidgetViewDraft } from '@/page-layout/widgets/record-table/hooks/useInitializeRecordTableWidgetViewDraft';
import { useViewById } from '@/views/hooks/useViewById';

type RecordTableWidgetViewDraftInitEffectProps = {
  widgetId: string;
  viewId: string;
};

export const RecordTableWidgetViewDraftInitEffect = ({
  widgetId,
  viewId,
}: RecordTableWidgetViewDraftInitEffectProps) => {
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();
  const { view } = useViewById(viewId);

  useInitializeRecordTableWidgetViewDraft({
    widgetId,
    view: isPageLayoutInEditMode ? view : undefined,
  });

  return null;
};
