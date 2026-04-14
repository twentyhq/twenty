import { useLocation, useParams } from 'react-router-dom';

import { activeNavigationMenuItemState } from '@/navigation-menu-item/common/states/activeNavigationMenuItemState';
import { useWorkspaceNavigationObjectMetadataIds } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationObjectMetadataIds';
import { NavigationDrawerSectionForObjectMetadataItems } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItems';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';

export const NavigationDrawerOpenedSection = () => {
  const { t } = useLingui();

  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  const { objectMetadataIdsWithObjectNavigationItem } =
    useWorkspaceNavigationObjectMetadataIds();

  const activeNavigationMenuItem = useAtomStateValue(
    activeNavigationMenuItemState,
  );

  const {
    objectNamePlural: currentObjectNamePlural,
    objectNameSingular: currentObjectNameSingular,
  } = useParams();

  const location = useLocation();

  const objectMetadataItem = activeObjectMetadataItems.find(
    (item) =>
      item.namePlural === currentObjectNamePlural ||
      item.nameSingular === currentObjectNameSingular,
  );

  const currentPathWithSearch = location.pathname + location.search;

  const isOnRecordShowPage =
    isDefined(objectMetadataItem) &&
    location.pathname.includes(
      getAppPath(AppPath.RecordShowPage, {
        objectNameSingular: objectMetadataItem.nameSingular,
        objectRecordId: '',
      }) + '/',
    );

  const isActiveItemOnCurrentPage =
    isDefined(activeNavigationMenuItem) &&
    currentPathWithSearch === activeNavigationMenuItem.path;

  const isActiveItemForCurrentObject =
    isOnRecordShowPage &&
    isDefined(activeNavigationMenuItem) &&
    activeNavigationMenuItem.objectMetadataId === objectMetadataItem?.id;

  const shouldShowOpenedSection =
    isDefined(objectMetadataItem) &&
    !objectMetadataIdsWithObjectNavigationItem.has(objectMetadataItem.id) &&
    !isActiveItemOnCurrentPage &&
    !isActiveItemForCurrentObject;

  return (
    <AnimatedExpandableContainer isExpanded={shouldShowOpenedSection}>
      <NavigationDrawerSectionForObjectMetadataItems
        sectionTitle={t`Opened`}
        objectMetadataItems={
          isDefined(objectMetadataItem) ? [objectMetadataItem] : []
        }
      />
    </AnimatedExpandableContainer>
  );
};
