import { isWidgetViewType } from 'twenty-shared/utils';

import { type View } from '@/views/types/View';

export const isViewDisplayableInNavigationMenu = (view: View): boolean =>
  !isWidgetViewType(view.type) && !view.isPrivate;
