import { type View } from '@/views/types/View';
import { ViewKey } from '@/views/types/ViewKey';
import { isDefined } from 'twenty-shared/utils';

export const computeViewPickerVisibleViews = <
  TView extends Pick<View, 'id' | 'key'>,
>({
  views,
  currentViewId,
  isSeededDefaultViewEnabled,
}: {
  views: TView[];
  currentViewId?: string;
  isSeededDefaultViewEnabled: boolean;
}): TView[] => {
  if (!isSeededDefaultViewEnabled) {
    return views;
  }

  const viewsWithoutIndexView = views.filter(
    (view) => view.key !== ViewKey.INDEX,
  );

  if (viewsWithoutIndexView.length === 0) {
    return views;
  }

  return views.filter(
    (view) =>
      view.key !== ViewKey.INDEX ||
      (isDefined(currentViewId) && view.id === currentViewId),
  );
};
