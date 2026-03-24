import { NavigationDrawerItemForObjectMetadataItem } from '@/navigation-menu-item/display/object/components/NavigationDrawerItemForObjectMetadataItem';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { isNavigationSectionOpenFamilyState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionOpenFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { isDefined } from 'twenty-shared/utils';

const ORDERED_FIRST_STANDARD_OBJECTS: string[] = [
  CoreObjectNameSingular.Person,
  'policy',
  CoreObjectNameSingular.Company,
  CoreObjectNameSingular.Opportunity,
  CoreObjectNameSingular.Note,
  CoreObjectNameSingular.Task,
];

const ORDERED_LAST_STANDARD_OBJECTS: string[] = [
  CoreObjectNameSingular.Dashboard,
];

type NavigationDrawerSectionForObjectMetadataItemsProps = {
  sectionTitle: string;
  isRemote: boolean;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  rightIcon?: React.ReactNode;
  respectProvidedOrder?: boolean;
  ignoreShowInSidebar?: boolean;
  selectedObjectMetadataItemId?: string | null;
  onObjectMetadataItemClick?: (
    objectMetadataItem: EnrichedObjectMetadataItem,
  ) => void;
  onActiveObjectMetadataItemClick?: (
    objectMetadataItem: EnrichedObjectMetadataItem,
  ) => void;
};

export const NavigationDrawerSectionForObjectMetadataItems = ({
  sectionTitle,
  isRemote,
  objectMetadataItems,
  rightIcon,
  respectProvidedOrder = false,
  ignoreShowInSidebar = false,
  selectedObjectMetadataItemId = null,
  onObjectMetadataItemClick,
  onActiveObjectMetadataItemClick,
}: NavigationDrawerSectionForObjectMetadataItemsProps) => {
  const navigationSectionId = 'Objects' + (isRemote ? 'Remote' : 'Workspace');
  const { toggleNavigationSection } = useNavigationSection(navigationSectionId);
  const isNavigationSectionOpen = useAtomFamilyStateValue(
    isNavigationSectionOpenFamilyState,
    navigationSectionId,
  );

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const objectMetadataItemsForNavigationItems = respectProvidedOrder
    ? objectMetadataItems
    : (() => {
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

        return [
          ...sortedStandardObjectMetadataItems,
          ...sortedCustomObjectMetadataItems,
          ...sortedLastStandardObjectMetadataItems,
        ];
      })();

  const objectMetadataItemsForNavigationItemsWithReadPermission =
    objectMetadataItemsForNavigationItems.filter((objectMetadataItem) => {
      const permissions = getObjectPermissionsForObject(
        objectPermissionsByObjectMetadataId,
        objectMetadataItem.id,
      );

      return (
        permissions.canReadObjectRecords &&
        (ignoreShowInSidebar || permissions.showInSidebar)
      );
    });

  return (
    objectMetadataItemsForNavigationItemsWithReadPermission.length > 0 && (
      <NavigationDrawerSection>
        <NavigationDrawerAnimatedCollapseWrapper>
          <NavigationDrawerSectionTitle
            label={sectionTitle}
            onClick={() => toggleNavigationSection()}
            rightIcon={rightIcon}
            isOpen={isNavigationSectionOpen}
          />
        </NavigationDrawerAnimatedCollapseWrapper>
        {isNavigationSectionOpen &&
          objectMetadataItemsForNavigationItemsWithReadPermission.map(
            (objectMetadataItem) => (
              <NavigationDrawerItemForObjectMetadataItem
                key={`navigation-drawer-item-${objectMetadataItem.id}`}
                objectMetadataItem={objectMetadataItem}
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
