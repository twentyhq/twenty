import { useIdentifyActiveNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useIdentifyActiveNavigationMenuItems';
import { NavigationDrawerSectionForObjectMetadataItems } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItems';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Collapsible } from 'twenty-ui/primitives/layout';

export const NavigationDrawerOpenedSection = () => {
  const { t } = useLingui();

  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  const { objectMetadataIdForOpenedSection } =
    useIdentifyActiveNavigationMenuItems();

  const objectMetadataItem = activeObjectMetadataItems.find(
    (item) => item.id === objectMetadataIdForOpenedSection,
  );

  if (!isDefined(objectMetadataItem)) {
    return null;
  }

  return (
    <Collapsible.Root open>
      <Collapsible.Panel>
        <NavigationDrawerSectionForObjectMetadataItems
          sectionTitle={t`Opened`}
          objectMetadataItems={[objectMetadataItem]}
        />
      </Collapsible.Panel>
    </Collapsible.Root>
  );
};
