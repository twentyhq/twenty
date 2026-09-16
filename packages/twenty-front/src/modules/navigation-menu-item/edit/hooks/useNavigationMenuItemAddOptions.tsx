import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  IconBox,
  IconFolder,
  IconLink,
  IconPerspective,
  IconTable,
  useIcons,
} from 'twenty-ui/icon';
import { Avatar, TintedIconTile } from 'twenty-ui/primitives/data-display';
import {
  FindAllStandalonePageLayoutsDocument,
  type NavigationMenuItem,
} from '~/generated-metadata/graphql';

import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER } from '@/navigation-menu-item/common/constants/NavigationMenuItemDefaultColorFolder';
import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_LINK } from '@/navigation-menu-item/common/constants/NavigationMenuItemDefaultColorLink';
import { navigationMenuItemsSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsSelector';
import { NavigationMenuItemIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemIcon';
import { type NavigationMenuItemOption } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { type NewNavigationMenuItemInput } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { useNavigationMenuItemSearchRecords } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemSearchRecords';
import { useNavigationMenuObjectMetadataForSection } from '@/navigation-menu-item/edit/hooks/useNavigationMenuObjectMetadataForSection';
import { getAvailableObjectMetadataForNewSidebarItem } from '@/navigation-menu-item/edit/utils/getAvailableObjectMetadataForNewSidebarItem';
import { isViewDisplayableInNavigationMenu } from '@/navigation-menu-item/edit/utils/isViewDisplayableInNavigationMenu';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getAvatarShape } from '@/object-metadata/utils/getAvatarShape';
import { getObjectColorWithFallback } from '@/object-metadata/utils/getObjectColorWithFallback';
import { ColoredIcon } from '@/ui/icon/components/ColoredIcon';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { ViewKey } from '@/views/types/ViewKey';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

export type NavigationMenuItemAddStep =
  | 'main'
  | 'object'
  | 'view'
  | 'record'
  | 'page';

type UseNavigationMenuItemAddOptionsParams = {
  step: NavigationMenuItemAddStep;
  search: string;
  objectId: string | null;
  folderId?: string;
  currentItems: NavigationMenuItem[];
  isSearchingAllItems: boolean;
  addItem: (input: NewNavigationMenuItemInput) => void;
  navigateToStep: (step: NavigationMenuItemAddStep) => void;
  selectObject: (objectId: string) => void;
};

export const useNavigationMenuItemAddOptions = ({
  step,
  search,
  objectId,
  folderId,
  currentItems,
  isSearchingAllItems,
  addItem,
  navigateToStep,
  selectObject,
}: UseNavigationMenuItemAddOptionsParams) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();

  const {
    data: standalonePagesData,
    loading: standalonePagesLoading,
    error: standalonePagesError,
  } = useQuery(FindAllStandalonePageLayoutsDocument, {
    skip: step !== 'page' && !isSearchingAllItems,
  });

  const navigationMenuItems = useAtomStateValue(navigationMenuItemsSelector);
  const { objectMetadataItems } = useObjectMetadataItems();
  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();
  const {
    views,
    objectMetadataIdsWithIndexView,
    objectMetadataIdsAlreadyAdded,
    viewIdsAlreadyAdded,
  } = useNavigationMenuObjectMetadataForSection(currentItems);
  const {
    navigationMenuItemSearchRecords,
    recordSearchLoading,
    isSearchDebouncing,
  } = useNavigationMenuItemSearchRecords({
    searchInput: search,
    currentItems,
    skip: step !== 'record' && !isSearchingAllItems,
  });
  const {
    availableObjectMetadataItems,
    availableSystemObjectMetadataItems,
    objectMetadataItemsWithViews,
    availableSystemObjectMetadataItemsForView,
  } = getAvailableObjectMetadataForNewSidebarItem({
    objectMetadataItems,
    activeNonSystemObjectMetadataItems,
    objectMetadataIdsWithIndexView,
    objectMetadataIdsWithDisplayableViews: new Set(
      views
        .filter((view) => view.key !== ViewKey.INDEX)
        .map((view) => view.objectMetadataId),
    ),
  });

  const getItems = (
    targetStep: NavigationMenuItemAddStep = step,
  ): NavigationMenuItemOption[] => {
    if (targetStep === 'main') {
      return [
        {
          id: 'object',
          label: t`Object`,
          icon: <TintedIconTile Icon={IconBox} />,
          onClick: () => navigateToStep('object'),
          hasSubMenu: true,
        },
        {
          id: 'view',
          label: t`View`,
          icon: <TintedIconTile Icon={IconTable} />,
          onClick: () => navigateToStep('view'),
          hasSubMenu: true,
        },
        {
          id: 'record',
          label: t`Record`,
          icon: <Avatar name={t`Record`} shape="circle" size="md" />,
          onClick: () => navigateToStep('record'),
          hasSubMenu: true,
        },
        {
          id: 'folder',
          label: t`Folder`,
          contextualText: isDefined(folderId)
            ? t`Cannot nest folders into folders`
            : undefined,
          Icon: isDefined(folderId) ? IconFolder : undefined,
          icon: isDefined(folderId) ? undefined : (
            <ColoredIcon
              Icon={IconFolder}
              color={DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER}
            />
          ),
          onClick: () => {
            addItem({
              type: NavigationMenuItemType.FOLDER,
              name: t`New folder`,
              color: DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER,
            });
          },
          isDisabled: isDefined(folderId),
        },
        {
          id: 'link',
          label: t`Link`,
          icon: (
            <ColoredIcon
              Icon={IconLink}
              color={DEFAULT_NAVIGATION_MENU_ITEM_COLOR_LINK}
            />
          ),
          onClick: () => {
            addItem({
              type: NavigationMenuItemType.LINK,
              name: 'Twenty',
              link: 'https://twenty.com',
              color: DEFAULT_NAVIGATION_MENU_ITEM_COLOR_LINK,
            });
          },
        },
        {
          id: 'page',
          label: t`Page`,
          icon: <TintedIconTile Icon={IconPerspective} />,
          onClick: () => navigateToStep('page'),
          hasSubMenu: true,
        },
      ];
    }
    if (
      targetStep === 'object' ||
      (targetStep === 'view' && !objectId && !isSearchingAllItems)
    ) {
      const objects =
        targetStep === 'object'
          ? [
              ...availableObjectMetadataItems,
              ...availableSystemObjectMetadataItems,
            ]
          : [
              ...objectMetadataItemsWithViews,
              ...availableSystemObjectMetadataItemsForView,
            ];
      if (targetStep === 'object') {
        objects.sort(
          (firstObject, secondObject) =>
            Number(objectMetadataIdsAlreadyAdded.has(firstObject.id)) -
            Number(objectMetadataIdsAlreadyAdded.has(secondObject.id)),
        );
      }
      return objects.map((object) => ({
        id: object.id,
        label: object.labelPlural,
        searchableValues: [
          object.labelPlural,
          object.labelSingular,
          object.namePlural,
          object.nameSingular,
        ],
        icon: <ObjectMetadataIcon objectMetadataItem={object} />,
        isAlreadyInSidebar:
          targetStep === 'object' &&
          objectMetadataIdsAlreadyAdded.has(object.id),
        isDisabled:
          targetStep === 'object' &&
          objectMetadataIdsAlreadyAdded.has(object.id),
        hasSubMenu: targetStep === 'view',
        onClick: () => {
          if (targetStep === 'view') {
            selectObject(object.id);
          } else {
            addItem({
              type: NavigationMenuItemType.OBJECT,
              targetObjectMetadataId: object.id,
              color: getObjectColorWithFallback(object),
            });
          }
        },
      }));
    }
    if (targetStep === 'view') {
      const objectIdsWithViews = new Set(
        [
          ...objectMetadataItemsWithViews,
          ...availableSystemObjectMetadataItemsForView,
        ].map((object) => object.id),
      );

      return views
        .filter(
          (view) =>
            (isSearchingAllItems
              ? objectIdsWithViews.has(view.objectMetadataId)
              : view.objectMetadataId === objectId) &&
            isViewDisplayableInNavigationMenu(view),
        )
        .sort((a, b) => a.position - b.position)
        .map((view) => {
          const Icon = getIcon(view.icon);
          return {
            id: view.id,
            label: view.name,
            icon: <TintedIconTile Icon={Icon} />,
            isDisabled: viewIdsAlreadyAdded.has(view.id),
            isAlreadyInSidebar: viewIdsAlreadyAdded.has(view.id),
            onClick: () =>
              addItem({ type: NavigationMenuItemType.VIEW, viewId: view.id }),
          };
        });
    }
    if (targetStep === 'page') {
      const pageLayoutIdsAlreadyAdded = new Set(
        currentItems.map((item) => item.pageLayoutId),
      );
      // Reversed relative to the lookup order: the last Map write wins, so
      // currentItems must come second to keep taking precedence.
      const navigationItemByPageLayoutId = new Map(
        [...navigationMenuItems, ...currentItems]
          .filter(
            (item) =>
              item.type === NavigationMenuItemType.PAGE_LAYOUT &&
              isDefined(item.pageLayoutId),
          )
          .map((item) => [item.pageLayoutId, item] as const),
      );

      return (standalonePagesData?.getPageLayouts ?? [])
        .map((page) => {
          const navigationItem = navigationItemByPageLayoutId.get(page.id);
          const name = navigationItem?.name ?? page.name;
          return {
            id: page.id,
            label: name,
            icon: navigationItem ? (
              <NavigationMenuItemIcon navigationMenuItem={navigationItem} />
            ) : (
              <TintedIconTile Icon={IconPerspective} />
            ),
            isDisabled: pageLayoutIdsAlreadyAdded.has(page.id),
            isAlreadyInSidebar: pageLayoutIdsAlreadyAdded.has(page.id),
            onClick: () =>
              addItem({
                type: NavigationMenuItemType.PAGE_LAYOUT,
                pageLayoutId: page.id,
                name,
                icon: navigationItem ? navigationItem.icon : 'IconPerspective',
                color: navigationItem?.color,
              }),
          };
        })
        .sort(
          (firstPage, secondPage) =>
            Number(firstPage.isAlreadyInSidebar) -
              Number(secondPage.isAlreadyInSidebar) ||
            firstPage.label.localeCompare(secondPage.label),
        );
    }
    if (targetStep === 'record') {
      return navigationMenuItemSearchRecords.flatMap((record) => {
        const object = objectMetadataItems.find(
          (object) => object.nameSingular === record.objectNameSingular,
        );
        if (!isDefined(object)) {
          return [];
        }
        return [
          {
            isDisabled: record.isAlreadyInSidebar,
            isAlreadyInSidebar: record.isAlreadyInSidebar,
            id: record.recordId,
            label: record.label,
            icon: (
              <Avatar
                name={record.label}
                shape={getAvatarShape(object)}
                size="md"
                src={getAbsoluteImageUrl(record.imageUrl)}
                colorSeed={record.recordId}
              />
            ),
            onClick: () =>
              addItem({
                type: NavigationMenuItemType.RECORD,
                targetObjectMetadataId: object.id,
                targetRecordId: record.recordId,
                targetRecordIdentifier: {
                  id: record.recordId,
                  labelIdentifier: record.label,
                  imageIdentifier: record.imageUrl ?? null,
                },
              }),
          },
        ];
      });
    }
    return [];
  };

  return {
    getItems,
    standalonePagesLoading,
    standalonePagesError,
    recordSearchLoading,
    isSearchDebouncing,
  };
};
