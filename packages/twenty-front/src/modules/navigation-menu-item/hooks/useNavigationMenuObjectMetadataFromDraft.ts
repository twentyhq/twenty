import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

import { coreViewsState } from '@/views/states/coreViewState';
import { ViewKey } from '@/views/types/ViewKey';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';

type NavigationMenuItemDraft = {
  id?: string;
  viewId?: string | null;
  targetObjectMetadataId?: string | null;
};

export const useNavigationMenuObjectMetadataFromDraft = (
  currentDraft: NavigationMenuItemDraft[],
) => {
  const coreViews = useRecoilValue(coreViewsState);
  const views = coreViews.map(convertCoreViewToView);

  const objectMetadataIdsInWorkspace = currentDraft.reduce<Set<string>>(
    (ids, item) => {
      const view = isDefined(item.viewId)
        ? views.find((view) => view.id === item.viewId)
        : undefined;
      if (isDefined(view)) {
        ids.add(view.objectMetadataId);
      }
      if (isDefined(item.targetObjectMetadataId)) {
        ids.add(item.targetObjectMetadataId);
      }
      return ids;
    },
    new Set<string>(),
  );

  const objectMetadataIdsWithIndexView = new Set(
    views
      .filter((view) => view.key === ViewKey.Index)
      .map((view) => view.objectMetadataId),
  );

  const objectMetadataIdsWithAnyView = new Set(
    views.map((view) => view.objectMetadataId),
  );

  const viewIdsInWorkspace = new Set(
    currentDraft.flatMap((item) =>
      isDefined(item.viewId) ? [item.viewId] : [],
    ),
  );

  return {
    views,
    objectMetadataIdsInWorkspace,
    objectMetadataIdsWithIndexView,
    objectMetadataIdsWithAnyView,
    viewIdsInWorkspace,
  };
};
