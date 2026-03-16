import { NavigationDrawerSectionForObjectMetadataItems } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItems';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useLingui } from '@lingui/react/macro';

export const RemoteNavigationDrawerSection = () => {
  const { t } = useLingui();

  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();
  const filteredActiveNonSystemObjectMetadataItems =
    activeNonSystemObjectMetadataItems.filter((item) => item.isRemote);

  return (
    <NavigationDrawerSectionForObjectMetadataItems
      sectionTitle={t`Remote`}
      objectMetadataItems={filteredActiveNonSystemObjectMetadataItems}
      isRemote={true}
    />
  );
};
