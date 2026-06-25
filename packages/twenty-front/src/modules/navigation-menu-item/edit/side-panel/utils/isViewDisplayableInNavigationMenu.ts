import { type View } from '@/views/types/View';
import { ViewType } from '@/views/types/ViewType';
import { ViewVisibility } from '~/generated-metadata/graphql';

export const isViewDisplayableInNavigationMenu = (view: View): boolean =>
  view.type !== ViewType.FIELDS_WIDGET &&
  view.type !== ViewType.TABLE_WIDGET &&
  view.visibility === ViewVisibility.WORKSPACE;
