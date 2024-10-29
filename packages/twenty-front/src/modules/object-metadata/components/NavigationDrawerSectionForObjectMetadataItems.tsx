import { NavigationDrawerItemForObjectMetadataItem } from '@/object-metadata/components/NavigationDrawerItemForObjectMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

const ORDERED_STANDARD_OBJECTS = [
  'person',
  'company',
  'opportunity',
  'task',
  'note',
];

const StyledObjectsMetaDataItemsWrapper = styled.div<{
  isMobile?: boolean;
}>`
  display: flex;
  flex-direction: ${({ isMobile }) => (isMobile ? 'row' : 'column')};
  gap: ${({ theme, isMobile }) =>
    isMobile ? theme.spacing(3) : theme.betweenSiblingsGap};
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  flex: 1;
  overflow-y: auto;
`;

const StyledNavigationDrawerSection = styled.div<{
  isMobile?: boolean;
}>`
  display: flex;
  gap: ${({ theme }) => theme.betweenSiblingsGap};
  margin-bottom: ${({ theme, isMobile }) => (isMobile ? 0 : theme.spacing(3))};
  overflow: hidden;
  flex-direction: ${({ isMobile }) => (isMobile ? 'row' : 'column')};
  flex: 1;
  min-width: 0;
`;

export const NavigationDrawerSectionForObjectMetadataItems = ({
  sectionTitle,
  isRemote,
  objectMetadataItems,
}: {
  sectionTitle: string;
  isRemote: boolean;
  objectMetadataItems: ObjectMetadataItem[];
}) => {
  const { toggleNavigationSection, isNavigationSectionOpenState } =
    useNavigationSection('Objects' + (isRemote ? 'Remote' : 'Workspace'));
  const isNavigationSectionOpen = useRecoilValue(isNavigationSectionOpenState);
  const isMobile = useIsMobile();

  const sortedStandardObjectMetadataItems = [...objectMetadataItems]
    .filter((item) => ORDERED_STANDARD_OBJECTS.includes(item.nameSingular))
    .sort((objectMetadataItemA, objectMetadataItemB) => {
      const indexA = ORDERED_STANDARD_OBJECTS.indexOf(
        objectMetadataItemA.nameSingular,
      );
      const indexB = ORDERED_STANDARD_OBJECTS.indexOf(
        objectMetadataItemB.nameSingular,
      );
      if (indexA === -1 || indexB === -1) {
        return objectMetadataItemA.nameSingular.localeCompare(
          objectMetadataItemB.nameSingular,
        );
      }
      return indexA - indexB;
    });

  const sortedCustomObjectMetadataItems = [...objectMetadataItems]
    .filter((item) => !ORDERED_STANDARD_OBJECTS.includes(item.nameSingular))
    .sort((objectMetadataItemA, objectMetadataItemB) => {
      return new Date(objectMetadataItemA.createdAt) <
        new Date(objectMetadataItemB.createdAt)
        ? 1
        : -1;
    });

  const objectMetadataItemsForNavigationItems = [
    ...sortedStandardObjectMetadataItems,
    ...sortedCustomObjectMetadataItems,
  ];

  return (
    objectMetadataItems.length > 0 && (
      <StyledNavigationDrawerSection isMobile={isMobile}>
        <NavigationDrawerAnimatedCollapseWrapper>
          <NavigationDrawerSectionTitle
            label={sectionTitle}
            onClick={() => toggleNavigationSection()}
          />
        </NavigationDrawerAnimatedCollapseWrapper>
        <ScrollWrapper contextProviderName="navigationDrawer">
          <StyledObjectsMetaDataItemsWrapper isMobile={isMobile}>
            {isNavigationSectionOpen &&
              objectMetadataItemsForNavigationItems.map(
                (objectMetadataItem) => (
                  <NavigationDrawerItemForObjectMetadataItem
                    key={`navigation-drawer-item-${objectMetadataItem.id}`}
                    objectMetadataItem={objectMetadataItem}
                  />
                ),
              )}
          </StyledObjectsMetaDataItemsWrapper>
        </ScrollWrapper>
      </StyledNavigationDrawerSection>
    )
  );
};
