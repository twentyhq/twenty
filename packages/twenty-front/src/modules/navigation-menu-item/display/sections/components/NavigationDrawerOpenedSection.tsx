import { useIdentifyActiveNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useIdentifyActiveNavigationMenuItems';
import { NavigationDrawerSectionForObjectMetadataItems } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItems';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';

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
    <AnimatedExpandableContainer isExpanded>
      <NavigationDrawerSectionForObjectMetadataItems
        sectionTitle={t`Opened`}
        objectMetadataItems={[objectMetadataItem]}
      />
    </AnimatedExpandableContainer>
  );
};
