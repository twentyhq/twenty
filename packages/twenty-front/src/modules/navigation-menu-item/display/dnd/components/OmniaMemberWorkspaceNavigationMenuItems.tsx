import { useLingui } from '@lingui/react/macro';

import { NavigationDrawerSectionForObjectMetadataItems } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItems';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import isEmpty from 'lodash.isempty';

export const OmniaMemberWorkspaceNavigationMenuItems = () => {
  const { t } = useLingui();
  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  // Don't render until permissions have loaded — otherwise every object
  // defaults to showInSidebar: true and flashes in the sidebar briefly.
  if (isEmpty(objectPermissionsByObjectMetadataId)) {
    return null;
  }

  return (
    <NavigationDrawerSectionForObjectMetadataItems
      sectionTitle={t`Workspace`}
      objectMetadataItems={activeNonSystemObjectMetadataItems}
      isRemote={false}
    />
  );
};
