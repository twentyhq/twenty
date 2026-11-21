import { isWidgetViewType } from 'twenty-shared/utils';

import { type ViewSummary } from '@/views/types/ViewSummary';
import { ViewVisibility } from '~/generated-metadata/graphql';

export const isViewDisplayableInNavigationMenu = (
  view: Pick<ViewSummary, 'type' | 'visibility'>,
): boolean =>
  !isWidgetViewType(view.type) && view.visibility === ViewVisibility.WORKSPACE;
