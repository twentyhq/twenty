import { NavigationDrawerItemForObjectMetadataItem } from '@/object-metadata/components/NavigationDrawerItemForObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { isNavigationSectionOpenFamilyState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionOpenFamilyState';
import { useFamilyRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilyRecoilValueV2';
import { isDefined } from 'twenty-shared/utils';

const ORDERED_FIRST_STANDARD_OBJECTS: string[] = [
  CoreObjectNameSingular.Person,
  CoreObjectNameSingular.Company,
  CoreObjectNameSingular.Opportunity,
  CoreObjectNameSingular.Task,
  CoreObjectNameSingular.Note,
];

const ORDERED_LAST_STANDARD_OBJECTS: string[] = [
  CoreObjectNameSingular.Dashboard,
];

type NavigationDrawerSectionForObjectMetadataItemsProps = {
  sectionTitle: string;
  isRemote: boolean;
  objectMetadataItems: ObjectMetadataItem[];
  rightIcon?: React.ReactNode;
  isEditMode?: boolean;
  selectedObjectMetadataItemId?: string | null;
  onObjectMetadataItemClick?: (objectMetadataItem: ObjectMetadataItem) => void;
  onActiveObjectMetadataItemClick?: (
    objectMetadataItem: ObjectMetadataItem,
  ) => void;
};

export const NavigationDrawerSectionForObjectMetadataItems = ({
  sectionTitle,
  isRemote,
  objectMetadataItems,
  rightIcon,
  isEditMode = false,
  selectedObjectMetadataItemId = null,
  onObjectMetadataItemClick,
  onActiveObjectMetadataItemClick,
}: NavigationDrawerSectionForObjectMetadataItemsProps) => {
  const navigationSectionId = 'Objects' + (isRemote ? 'Remote' : 'Workspace');
  const { toggleNavigationSection } = useNavigationSection(navigationSectionId);
  const isNavigationSectionOpen = useFamilyRecoilValueV2(
    isNavigationSectionOpenFamilyState,
    navigationSectionId,
  );

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const sortedStandardObjectMetadataItems = [...objectMetadataItems]
    .filter(
      (item) =>
        ORDERED_FIRST_STANDARD_OBJECTS.includes(item.nameSingular) &&
        !ORDERED_LAST_STANDARD_OBJECTS.includes(item.nameSingular),
    )
    .sort((objectMetadataItemA, objectMetadataItemB) => {
      const indexA = ORDERED_FIRST_STANDARD_OBJECTS.indexOf(
        objectMetadataItemA.nameSingular,
      );
      const indexB = ORDERED_FIRST_STANDARD_OBJECTS.indexOf(
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
    .filter(
      (item) =>
        !ORDERED_FIRST_STANDARD_OBJECTS.includes(item.nameSingular) &&
        !ORDERED_LAST_STANDARD_OBJECTS.includes(item.nameSingular),
    )
    .sort((objectMetadataItemA, objectMetadataItemB) => {
      return new Date(objectMetadataItemA.createdAt) <
        new Date(objectMetadataItemB.createdAt)
        ? 1
        : -1;
    });

  const sortedLastStandardObjectMetadataItems =
    ORDERED_LAST_STANDARD_OBJECTS.map((nameSingular) => {
      return objectMetadataItems.find(
        (item) => item.nameSingular === nameSingular,
      );
    }).filter(isDefined);

  const objectMetadataItemsForNavigationItems = [
    ...sortedStandardObjectMetadataItems,
    ...sortedCustomObjectMetadataItems,
    ...sortedLastStandardObjectMetadataItems,
  ];

  const objectMetadataItemsForNavigationItemsWithReadPermission =
    objectMetadataItemsForNavigationItems.filter(
      (objectMetadataItem) =>
        getObjectPermissionsForObject(
          objectPermissionsByObjectMetadataId,
          objectMetadataItem.id,
        ).canReadObjectRecords,
    );

  return (
    objectMetadataItems.length > 0 && (
      <NavigationDrawerSection>
        <NavigationDrawerAnimatedCollapseWrapper>
          <NavigationDrawerSectionTitle
            label={sectionTitle}
            onClick={() => toggleNavigationSection()}
            rightIcon={rightIcon}
          />
        </NavigationDrawerAnimatedCollapseWrapper>
        {isNavigationSectionOpen &&
          objectMetadataItemsForNavigationItemsWithReadPermission.map(
            (objectMetadataItem) => (
              <NavigationDrawerItemForObjectMetadataItem
                key={`navigation-drawer-item-${objectMetadataItem.id}`}
                objectMetadataItem={objectMetadataItem}
                isEditMode={isEditMode}
                isSelectedInEditMode={
                  selectedObjectMetadataItemId === objectMetadataItem.id
                }
                onEditModeClick={
                  onObjectMetadataItemClick
                    ? () => onObjectMetadataItemClick(objectMetadataItem)
                    : undefined
                }
                onActiveItemClickWhenNotInEditMode={
                  onActiveObjectMetadataItemClick
                    ? () => onActiveObjectMetadataItemClick(objectMetadataItem)
                    : undefined
                }
              />
            ),
          )}
      </NavigationDrawerSection>
    )
  );
};
