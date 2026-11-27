import { isWidgetViewType } from 'twenty-shared/utils';

import { type ViewSummary } from '@/views/types/ViewSummary';

export const isViewDisplayableInNavigationMenu = (
  view: Pick<ViewSummary, 'type' | 'isPrivate'>,
): boolean => !isWidgetViewType(view.type) && !view.isPrivate;
