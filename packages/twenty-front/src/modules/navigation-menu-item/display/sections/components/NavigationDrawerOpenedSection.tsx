import { useParams } from 'react-router-dom';

import { useWorkspaceNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuItems';
import { NavigationDrawerSectionForObjectMetadataItems } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItems';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
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
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

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
  // For non-layout users, exclude objects already shown in the workspace
  // section via showInSidebar permission.
  const isObjectAlreadyInNavbar = objectMetadataIdsInWorkspaceNav.has(
    objectMetadataItem.id,
  );

  const isAlreadyShownInWorkspaceSection =
    !hasLayoutsPermission &&
    getObjectPermissionsForObject(
      objectPermissionsByObjectMetadataId,
      objectMetadataItem.id,
    ).showInSidebar;

  return (
    !isObjectAlreadyInNavbar &&
    !isAlreadyShownInWorkspaceSection && (
      <NavigationDrawerSectionForObjectMetadataItems
        sectionTitle={t`Opened`}
        objectMetadataItems={[objectMetadataItem]}
        isRemote={false}
      />
    )
  );
};
