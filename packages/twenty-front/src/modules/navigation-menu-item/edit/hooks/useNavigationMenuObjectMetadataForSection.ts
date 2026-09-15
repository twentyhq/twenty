import { isDefined } from 'twenty-shared/utils';

import { getObjectMetadataIdsInDraft } from '@/navigation-menu-item/common/utils/getObjectMetadataIdsInDraft';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { ViewKey } from '@/views/types/ViewKey';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type NavigationMenuItemForDedup = Pick<
  NavigationMenuItem,
  'id' | 'type' | 'viewId' | 'targetObjectMetadataId'
>;

// Derives which objects/views are already present in the given section's items,
// so the add pickers can hide or disable what's already there.
export const useNavigationMenuObjectMetadataForSection = (
  sectionItems: NavigationMenuItemForDedup[],
) => {
  const views = useAtomStateValue(viewsSelector);

  const objectMetadataIdsAlreadyAdded =
    getObjectMetadataIdsInDraft(sectionItems);

  const objectMetadataIdsWithIndexView = new Set(
    views
      .filter((view) => view.key === ViewKey.INDEX)
      .map((view) => view.objectMetadataId),
  );

  const objectMetadataIdsWithAnyView = new Set(
    views.map((view) => view.objectMetadataId),
  );

  const viewIdsAlreadyAdded = new Set(
    sectionItems.flatMap((item) =>
      isDefined(item.viewId) ? [item.viewId] : [],
    ),
  );

  return {
    views,
    objectMetadataIdsAlreadyAdded,
    objectMetadataIdsWithIndexView,
    objectMetadataIdsWithAnyView,
    viewIdsAlreadyAdded,
  };
};
