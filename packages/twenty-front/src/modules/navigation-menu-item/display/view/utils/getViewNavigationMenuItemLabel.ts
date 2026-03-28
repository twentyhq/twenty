import { type View } from '@/views/types/View';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getViewNavigationMenuItemLabel = (
  item: Pick<NavigationMenuItem, 'viewId'>,
  views: Pick<View, 'id' | 'name' | 'objectMetadataId' | 'key'>[],
): string => {
  const view = views.find((view) => view.id === item.viewId);
  if (!isDefined(view)) {
    return '';
  }
  return view.name;
};
