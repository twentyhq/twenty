import { isDefined } from 'twenty-shared/utils';

import { getObjectMetadataIdsInDraft } from '@/navigation-menu-item/common/utils/getObjectMetadataIdsInDraft';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { ViewKey } from '@/views/types/ViewKey';

type NavigationMenuItemDraft = {
  id?: string;
  viewId?: string | null;
  targetObjectMetadataId?: string | null;
};

export const useNavigationMenuObjectMetadataFromDraft = (
  currentDraft: NavigationMenuItemDraft[],
) => {
  const views = useAtomStateValue(viewsSelector);

  const objectMetadataIdsInWorkspace = getObjectMetadataIdsInDraft(
    currentDraft,
    views,
  );

  const objectMetadataIdsWithIndexView = new Set(
    views
      .filter((view) => view.key === ViewKey.INDEX)
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
