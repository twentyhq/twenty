import { type View } from '@/views/types/View';
import { ViewKey } from '@/views/types/ViewKey';
import { isDefined, isWidgetViewType } from 'twenty-shared/utils';

export const isUsableLastVisitedView = ({
  lastVisitedView,
  isInitialObjectViewEnabled,
}: {
  lastVisitedView: Pick<View, 'key' | 'type'> | undefined;
  isInitialObjectViewEnabled: boolean;
}): boolean => {
  if (!isDefined(lastVisitedView)) {
    return false;
  }

  if (isWidgetViewType(lastVisitedView.type)) {
    return false;
  }

  return !isInitialObjectViewEnabled || lastVisitedView.key !== ViewKey.INDEX;
};
