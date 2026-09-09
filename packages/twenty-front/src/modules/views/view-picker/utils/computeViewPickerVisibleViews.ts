import { type View } from '@/views/types/View';
import { ViewKey } from '@/views/types/ViewKey';
import { isDefined } from 'twenty-shared/utils';

export const computeViewPickerVisibleViews = <
  TView extends Pick<View, 'id' | 'key'>,
>({
  views,
  currentViewId,
}: {
  views: TView[];
  currentViewId?: string;
}): TView[] => {
  const hasDefaultView = views.some((view) => view.key === ViewKey.DEFAULT);

  if (!hasDefaultView) {
    return views;
  }

  return views.filter(
    (view) =>
      view.key !== ViewKey.INDEX ||
      (isDefined(currentViewId) && view.id === currentViewId),
  );
};
