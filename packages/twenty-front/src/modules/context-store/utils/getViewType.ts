import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { type View } from '@/views/types/View';
import { ViewType } from '@/views/types/ViewType';

export const getViewType = ({
  isSettingsPage,
  isRecordShowPage,
  isRecordIndexPage,
  view,
}: {
  isSettingsPage: boolean;
  isRecordShowPage: boolean;
  isRecordIndexPage: boolean;
  view?: View;
}) => {
  if (isSettingsPage) {
    return null;
  }

  if (isRecordIndexPage) {
    return view?.type === ViewType.Kanban
      ? ContextStoreViewType.Kanban
      : ContextStoreViewType.Table;
  }

  if (isRecordShowPage) {
    return ContextStoreViewType.ShowPage;
  }

  return null;
};
