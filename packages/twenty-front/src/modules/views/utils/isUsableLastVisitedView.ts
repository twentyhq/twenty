import { type View } from '@/views/types/View';
import { ViewKey } from '@/views/types/ViewKey';
import { isDefined, isWidgetViewType } from 'twenty-shared/utils';

export const isUsableLastVisitedView = ({
  lastVisitedView,
}: {
  lastVisitedView: Pick<View, 'key' | 'type'> | undefined;
}): boolean => {
  if (!isDefined(lastVisitedView)) {
    return false;
  }

  if (isWidgetViewType(lastVisitedView.type)) {
    return false;
  }

  return lastVisitedView.key !== ViewKey.INDEX;
};
