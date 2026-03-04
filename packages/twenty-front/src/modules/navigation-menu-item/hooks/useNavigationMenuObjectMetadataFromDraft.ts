import { isDefined } from 'twenty-shared/utils';

import { getObjectMetadataIdsInDraft } from '@/navigation-menu-item/utils/getObjectMetadataIdsInDraft';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
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
  const coreViews = useAtomStateValue(coreViewsState);
  const views = coreViews.map(convertCoreViewToView);

  const objectMetadataIdsInWorkspace = getObjectMetadataIdsInDraft(
    currentDraft,
    views,
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
