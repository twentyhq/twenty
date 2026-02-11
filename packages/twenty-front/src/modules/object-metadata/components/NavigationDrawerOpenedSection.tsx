import { useParams } from 'react-router-dom';

import { useWorkspaceFavorites } from '@/favorites/hooks/useWorkspaceFavorites';
import { useWorkspaceNavigationMenuItems } from '@/navigation-menu-item/hooks/useWorkspaceNavigationMenuItems';
import { NavigationDrawerSectionForObjectMetadataItems } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItems';
import { NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useLingui } from '@lingui/react/macro';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

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

  const loading = useIsPrefetchLoading();

  const { workspaceFavoritesObjectMetadataItems } = useWorkspaceFavorites();
  const { workspaceNavigationMenuItemsObjectMetadataItems } =
    useWorkspaceNavigationMenuItems();
  const isNavigationMenuItemEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_ENABLED,
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

  const workspaceItemsToExclude = isNavigationMenuItemEnabled
    ? workspaceNavigationMenuItemsObjectMetadataItems
    : workspaceFavoritesObjectMetadataItems;

  const isWorkflowObjectInSidebar = WORKFLOW_OBJECTS_IN_SIDEBAR.includes(
    objectMetadataItem.nameSingular as CoreObjectNameSingular,
  );

  const shouldDisplayObjectInOpenedSection =
    !isWorkflowObjectInSidebar &&
    !workspaceItemsToExclude
      .map((item) => item.id)
      .includes(objectMetadataItem.id);

  if (loading) {
    return <NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader />;
  }

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
