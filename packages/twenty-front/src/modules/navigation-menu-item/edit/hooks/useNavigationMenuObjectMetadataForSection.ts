import { isDefined } from 'twenty-shared/utils';

import { getObjectMetadataIdsInDraft } from '@/navigation-menu-item/common/utils/getObjectMetadataIdsInDraft';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewSummariesSelector } from '@/views/states/selectors/viewSummariesSelector';
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
  const viewSummaries = useAtomStateValue(viewSummariesSelector);

  const objectMetadataIdsAlreadyAdded =
    getObjectMetadataIdsInDraft(sectionItems);

  const objectMetadataIdsWithIndexView = new Set(
    viewSummaries
      .filter((view) => view.key === ViewKey.INDEX)
      .map((view) => view.objectMetadataId),
  );

  const objectMetadataIdsWithAnyView = new Set(
    viewSummaries.map((view) => view.objectMetadataId),
  );

  const viewIdsAlreadyAdded = new Set(
    sectionItems.flatMap((item) =>
      isDefined(item.viewId) ? [item.viewId] : [],
    ),
  );

  return {
    views: viewSummaries,
    objectMetadataIdsAlreadyAdded,
    objectMetadataIdsWithIndexView,
    objectMetadataIdsWithAnyView,
    viewIdsAlreadyAdded,
  };
};
