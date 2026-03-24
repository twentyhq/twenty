import { useLingui } from '@lingui/react/macro';

import { NavigationDrawerSectionForObjectMetadataItems } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItems';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';

export const OmniaMemberWorkspaceNavigationMenuItems = () => {
  const { t } = useLingui();
  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();

  return (
    <NavigationDrawerSectionForObjectMetadataItems
      sectionTitle={t`Workspace`}
      objectMetadataItems={activeNonSystemObjectMetadataItems}
      isRemote={false}
    />
  );
};
