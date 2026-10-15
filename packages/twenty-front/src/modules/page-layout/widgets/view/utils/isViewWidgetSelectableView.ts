import { type View } from '@/views/types/View';
import { ViewVisibility } from '~/generated-metadata/graphql';

export const isViewWidgetSelectableView = (view: Pick<View, 'visibility'>) =>
  view.visibility === ViewVisibility.WORKSPACE;
