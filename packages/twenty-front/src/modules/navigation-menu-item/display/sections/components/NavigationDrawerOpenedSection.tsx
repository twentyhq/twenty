import { useParams } from 'react-router-dom';

import { getOmniaMemberWorkspaceObjectMetadataItems } from '@/navigation-menu-item/common/utils/getOmniaMemberWorkspaceObjectMetadataItems';
import { useWorkspaceNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuItems';
import { NavigationDrawerSectionForObjectMetadataItems } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItems';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useLingui } from '@lingui/react/macro';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const NavigationDrawerOpenedSection = () => {
  const { t } = useLingui();

  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();
  const filteredActiveNonSystemObjectMetadataItems =
    activeObjectMetadataItems.filter((item) => !item.isRemote);

  const hasLayoutsPermission = useHasPermissionFlag(PermissionFlagType.LAYOUTS);

  const { objectMetadataIdsInWorkspaceNav } = useWorkspaceNavigationMenuItems();

  const omniaMemberWorkspaceObjectMetadataItems =
    getOmniaMemberWorkspaceObjectMetadataItems(
      filteredActiveNonSystemObjectMetadataItems,
    );

  const {
    objectNamePlural: currentObjectNamePlural,
    objectNameSingular: currentObjectNameSingular,
  } = useParams();

  if (!currentObjectNamePlural && !currentObjectNameSingular) {
    return;
  }

  const objectMetadataItem = filteredActiveNonSystemObjectMetadataItems.find(
    (item) =>
      item.namePlural === currentObjectNamePlural ||
      item.nameSingular === currentObjectNameSingular,
  );

  if (!objectMetadataItem) {
    return;
  }

  // For admins, upstream's objectMetadataIdsInWorkspaceNav handles exclusion.
  // For members, also exclude Omnia member workspace objects (Leads, Calls, Policies, Notes, Tasks)
  // since those are shown via OmniaMemberWorkspaceNavigationMenuItems.
  const isObjectAlreadyInNavbar = objectMetadataIdsInWorkspaceNav.has(
    objectMetadataItem.id,
  );

  const isOmniaMemberWorkspaceObject =
    !hasLayoutsPermission &&
    omniaMemberWorkspaceObjectMetadataItems.some(
      (workspaceObjectMetadataItem) =>
        workspaceObjectMetadataItem.id === objectMetadataItem.id,
    );

  return (
    !isObjectAlreadyInNavbar &&
    !isOmniaMemberWorkspaceObject && (
      <NavigationDrawerSectionForObjectMetadataItems
        sectionTitle={t`Opened`}
        objectMetadataItems={[objectMetadataItem]}
        isRemote={false}
      />
    )
  );
};
