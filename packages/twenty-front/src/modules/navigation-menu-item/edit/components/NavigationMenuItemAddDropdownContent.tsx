import { type NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';
import { navigationMenuItemsSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsSelector';
import { NavigationMenuItemIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemIcon';
import { getAvatarShape } from '@/object-metadata/utils/getAvatarShape';
import { useQuery } from '@apollo/client/react';
import { FindAllStandalonePageLayoutsDocument } from '~/generated-metadata/graphql';
import { navigationMenuItemIdToRenameState } from '@/navigation-menu-item/common/states/navigationMenuItemIdToRenameState';
import { navigationMenuItemInsertionPreviewState } from '@/navigation-menu-item/common/states/navigationMenuItemInsertionPreviewState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  NavigationMenuItemSelectableItem,
  type NavigationMenuItemOption,
} from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { Fragment, useEffect, useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  IconChevronLeft,
  IconX,
  IconBox,
  IconPerspective,
  IconFolder,
  IconLink,
  IconTable,
  useIcons,
} from 'twenty-ui/icon';
import { Avatar, TintedIconTile } from 'twenty-ui/primitives/data-display';
import { MenuItem } from 'twenty-ui/primitives/navigation';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSectionLabel } from '@/ui/layout/dropdown/components/DropdownMenuSectionLabel';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import {
  useNavigationMenuItemEditController,
  type NewNavigationMenuItemInput,
} from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { useNavigationMenuObjectMetadataForSection } from '@/navigation-menu-item/edit/hooks/useNavigationMenuObjectMetadataForSection';
import { useNavigationMenuItemSearchRecords } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemSearchRecords';
import { getAvailableObjectMetadataForNewSidebarItem } from '@/navigation-menu-item/edit/utils/getAvailableObjectMetadataForNewSidebarItem';
import { isViewDisplayableInNavigationMenu } from '@/navigation-menu-item/edit/utils/isViewDisplayableInNavigationMenu';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { getObjectColorWithFallback } from '@/object-metadata/utils/getObjectColorWithFallback';
import { ColoredIcon } from '@/ui/icon/components/ColoredIcon';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER } from '@/navigation-menu-item/common/constants/NavigationMenuItemDefaultColorFolder';
import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_LINK } from '@/navigation-menu-item/common/constants/NavigationMenuItemDefaultColorLink';
import { ViewKey } from '@/views/types/ViewKey';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

type Step = 'main' | 'object' | 'view' | 'record' | 'page';
type NavigationMenuItemAddDropdownContentProps = {
  dropdownId: string;
  section: NavigationMenuItemSection;
  folderId?: string;
  position?: number;
  onClose: () => void;
};

export const NavigationMenuItemAddDropdownContent = ({
  dropdownId,
  section,
  folderId,
  position,
  onClose,
}: NavigationMenuItemAddDropdownContentProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const setSelectedNavigationMenuItemIdInEditMode = useSetAtomState(
    selectedNavigationMenuItemIdInEditModeState,
  );
  const setNavigationMenuItemIdToRename = useSetAtomState(
    navigationMenuItemIdToRenameState,
  );
  const [step, setStep] = useState<Step>('main');
  const [search, setSearch] = useState('');
  const isSearchingAllItems = step === 'main' && search.trim().length > 0;
  const {
    data: standalonePagesData,
    loading: standalonePagesLoading,
    error: standalonePagesError,
  } = useQuery(FindAllStandalonePageLayoutsDocument, {
    skip: step !== 'page' && !isSearchingAllItems,
  });
  const [objectId, setObjectId] = useState<string | null>(null);
  const { currentItems, createItem } =
    useNavigationMenuItemEditController(section);
  const navigationMenuItems = useAtomStateValue(navigationMenuItemsSelector);
  const setNavigationMenuItemInsertionPreview = useSetAtomState(
    navigationMenuItemInsertionPreviewState,
  );
  const insertionIndex =
    position ??
    currentItems.filter(
      (item) => (item.folderId ?? null) === (folderId ?? null),
    ).length;

  // The preview follows the add flow's lifetime, including nested menu pages.
  useEffect(() => {
    setNavigationMenuItemInsertionPreview({
      dropdownId,
      section,
      folderId: folderId ?? null,
      index: insertionIndex,
    });
    return () =>
      setNavigationMenuItemInsertionPreview((preview) =>
        preview?.dropdownId === dropdownId ? null : preview,
      );
  }, [
    dropdownId,
    section,
    folderId,
    insertionIndex,
    setNavigationMenuItemInsertionPreview,
  ]);

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

  const addItem = (input: NewNavigationMenuItemInput) => {
    const itemId = createItem(input, {
      targetFolderId: folderId ?? null,
      targetIndex: position,
    });
    onClose();
    setSelectedNavigationMenuItemIdInEditMode(itemId);
    if (input.type === NavigationMenuItemType.FOLDER) {
      setNavigationMenuItemIdToRename(itemId);
    }
  };
  const navigate = (next: Step) => {
    setStep(next);
    setSearch('');
    setObjectId(null);
  };
  const goBack = () => {
    setSearch('');
    if (isDefined(objectId)) {
      setObjectId(null);
    } else {
      setStep('main');
    }
  };
  const titles: Record<Step, string> = {
    main: t`Add menu item`,
    object: t`Object`,
    view: t`View`,
    record: t`Record`,
    page: t`Page`,
  };

  const getItems = (targetStep: Step = step): NavigationMenuItemOption[] => {
    if (targetStep === 'main') {
      return [
        {
          id: 'object',
          label: t`Object`,
          icon: <TintedIconTile Icon={IconBox} />,
          onClick: () => navigate('object'),
          hasSubMenu: true,
        },
        {
          id: 'view',
          label: t`View`,
          icon: <TintedIconTile Icon={IconTable} />,
          onClick: () => navigate('view'),
          hasSubMenu: true,
        },
        {
          id: 'record',
          label: t`Record`,
          icon: <Avatar name={t`Record`} shape="circle" size="md" />,
          onClick: () => navigate('record'),
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
          onClick: () => navigate('page'),
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
            setObjectId(object.id);
            setSearch('');
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
  const normalizedSearch = normalizeSearchText(search.trim());
  const matchesSearch = (item: NavigationMenuItemOption) =>
    (item.searchableValues ?? [item.label]).some((value) =>
      normalizeSearchText(value).includes(normalizedSearch),
    );
  const groups = isSearchingAllItems
    ? [
        { label: t`Objects`, items: getItems('object').filter(matchesSearch) },
        { label: t`Views`, items: getItems('view').filter(matchesSearch) },
        { label: t`Pages`, items: getItems('page').filter(matchesSearch) },
        {
          label: t`Records`,
          items: isSearchDebouncing ? [] : getItems('record'),
        },
        {
          label: t`Other`,
          items: getItems('main').filter(
            (item) =>
              (item.id === 'folder' || item.id === 'link') &&
              matchesSearch(item),
          ),
        },
      ]
    : [
        {
          label: '',
          items: getItems().filter(
            (item) => step === 'record' || matchesSearch(item),
          ),
        },
      ];
  const items = groups.flatMap((group) => group.items);
  let emptyMessage = t`No results found`;
  if (
    (step === 'record' || isSearchingAllItems) &&
    (recordSearchLoading || isSearchDebouncing)
  ) {
    emptyMessage = t`Loading...`;
  }

  if ((step === 'page' || isSearchingAllItems) && standalonePagesLoading) {
    emptyMessage = t`Loading...`;
  }
  if (step === 'page' && standalonePagesError) {
    emptyMessage = t`Couldn't load pages`;
  }

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            Icon={step === 'main' ? IconX : IconChevronLeft}
            onClick={step === 'main' ? onClose : goBack}
          />
        }
      >
        {titles[step]}
      </DropdownMenuHeader>
      <DropdownMenuSearchInput
        key={`search-${step}-${objectId}`}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={step === 'record' ? t`Search records...` : t`Search...`}
      />
      <DropdownMenuSeparator />
      <SelectableList
        key={`${step}-${objectId}`}
        selectableListInstanceId={`${dropdownId}-list`}
        focusId={dropdownId}
        selectableItemIdArray={items
          .filter((item) => !item.isDisabled)
          .map((item) => item.id)}
      >
        <DropdownMenuItemsContainer hasMaxHeight>
          {groups
            .filter((group) => group.items.length > 0)
            .map((group) => (
              <Fragment key={group.label}>
                {group.label && (
                  <DropdownMenuSectionLabel label={group.label} />
                )}
                {group.items.map((item) => (
                  <NavigationMenuItemSelectableItem key={item.id} item={item} />
                ))}
              </Fragment>
            ))}
          {items.length === 0 && (
            <MenuItem disabled text={emptyMessage} accent="placeholder" />
          )}
        </DropdownMenuItemsContainer>
      </SelectableList>
    </DropdownContent>
  );
};
