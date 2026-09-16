import { isWidgetViewType } from 'twenty-shared/utils';

import { type View } from '@/views/types/View';
import { ViewVisibility } from '~/generated-metadata/graphql';

export const isViewDisplayableInNavigationMenu = (view: View): boolean =>
  !isWidgetViewType(view.type) && view.visibility === ViewVisibility.WORKSPACE;
