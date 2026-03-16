import { useParams } from 'react-router-dom';

import { getOmniaMemberWorkspaceObjectMetadataItems } from '@/navigation-menu-item/utils/getOmniaMemberWorkspaceObjectMetadataItems';
import { useWorkspaceNavigationMenuItems } from '@/navigation-menu-item/hooks/useWorkspaceNavigationMenuItems';
import { NavigationDrawerSectionForObjectMetadataItems } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItems';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useLingui } from '@lingui/react/macro';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const WORKFLOW_OBJECTS_IN_SIDEBAR = [
  CoreObjectNameSingular.Workflow,
  CoreObjectNameSingular.WorkflowRun,
  CoreObjectNameSingular.WorkflowVersion,
];

export const NavigationDrawerOpenedSection = () => {
  const { t } = useLingui();

  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();
  const filteredActiveNonSystemObjectMetadataItems =
    activeObjectMetadataItems.filter((item) => !item.isRemote);

  const hasLayoutsPermission = useHasPermissionFlag(PermissionFlagType.LAYOUTS);

  const { workspaceNavigationMenuItemsObjectMetadataItems } =
    useWorkspaceNavigationMenuItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
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

  const workspaceItemsToExclude = hasLayoutsPermission
    ? workspaceNavigationMenuItemsObjectMetadataItems
    : omniaMemberWorkspaceObjectMetadataItems;

  const isWorkflowObjectInSidebar = WORKFLOW_OBJECTS_IN_SIDEBAR.includes(
    objectMetadataItem.nameSingular as CoreObjectNameSingular,
  );
  const objectPermissions = getObjectPermissionsForObject(
    objectPermissionsByObjectMetadataId,
    objectMetadataItem.id,
  );
  const isOmniaMemberWorkspaceObject =
    omniaMemberWorkspaceObjectMetadataItems.some(
      (workspaceObjectMetadataItem) =>
        workspaceObjectMetadataItem.id === objectMetadataItem.id,
    );
  const shouldDisplayObjectInOpenedSectionForMemberWorkspace =
    !hasLayoutsPermission && isOmniaMemberWorkspaceObject;

  const shouldDisplayObjectInOpenedSection =
    !isWorkflowObjectInSidebar &&
    (objectPermissions.showInSidebar ||
      shouldDisplayObjectInOpenedSectionForMemberWorkspace) &&
    !workspaceItemsToExclude
      .map((item) => item.id)
      .includes(objectMetadataItem.id);

  return (
    shouldDisplayObjectInOpenedSection && (
      <NavigationDrawerSectionForObjectMetadataItems
        sectionTitle={t`Opened`}
        objectMetadataItems={[objectMetadataItem]}
        isRemote={false}
      />
    )
  );
};
