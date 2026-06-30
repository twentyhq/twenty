import { isNonEmptyString } from '@sniptt/guards';
import { useLingui } from '@lingui/react/macro';
import { ObjectIconWithViewOverlay } from '@/navigation-menu-item/display/view/components/ObjectIconWithViewOverlay';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';

import { pendingInsertionNavigationMenuItemState } from '@/navigation-menu-item/common/states/pendingInsertionNavigationMenuItemState';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { useNavigationMenuObjectMetadataForSection } from '@/navigation-menu-item/edit/hooks/useNavigationMenuObjectMetadataForSection';
import { useOpenNavigationMenuItemInSidePanel } from '@/navigation-menu-item/edit/hooks/useOpenNavigationMenuItemInSidePanel';
import { SidePanelNewSidebarItemRecordItem } from '@/navigation-menu-item/edit/side-panel/components/SidePanelNewSidebarItemRecordItem';
import { SidePanelObjectMenuItem } from '@/navigation-menu-item/edit/side-panel/components/SidePanelObjectMenuItem';
import { useAvailableNavigationMenuItemSearchRecords } from '@/navigation-menu-item/edit/side-panel/hooks/useAvailableNavigationMenuItemSearchRecords';
import { getAvailableObjectMetadataForNewSidebarItem } from '@/navigation-menu-item/edit/side-panel/utils/getAvailableObjectMetadataForNewSidebarItem';
import { isViewDisplayableInNavigationMenu } from '@/navigation-menu-item/edit/side-panel/utils/isViewDisplayableInNavigationMenu';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectColorWithFallback } from '@/object-metadata/utils/getObjectColorWithFallback';
import { SidePanelAddToNavigationDroppable } from '@/side-panel/components/SidePanelAddToNavigationDroppable';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelItemWithAddToNavigationDrag } from '@/side-panel/components/SidePanelItemWithAddToNavigationDrag';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { type View } from '@/views/types/View';
import { ViewKey } from '@/views/types/ViewKey';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

type SidePanelNewSidebarItemSearchResultsProps = {
  searchValue: string;
};

export const SidePanelNewSidebarItemSearchResults = ({
  searchValue,
}: SidePanelNewSidebarItemSearchResultsProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { currentItems, createItem } = useNavigationMenuItemEditController();
  const [
    pendingInsertionNavigationMenuItem,
    setPendingInsertionNavigationMenuItem,
  ] = useAtomState(pendingInsertionNavigationMenuItemState);
  const { openNavigationMenuItemInSidePanel } =
    useOpenNavigationMenuItemInSidePanel();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();
  const { views, objectMetadataIdsWithIndexView, viewIdsAlreadyAdded } =
    useNavigationMenuObjectMetadataForSection(currentItems);
  const trimmedSearchValue = searchValue.trim();
  const { availableSearchRecords, isSearchDebouncing, recordSearchLoading } =
    useAvailableNavigationMenuItemSearchRecords({
      searchInput: trimmedSearchValue,
      skip: !isNonEmptyString(trimmedSearchValue),
    });
  const isRecordSearchLoading = recordSearchLoading || isSearchDebouncing;

  const availableViews = views
    .filter((view) => view.key !== ViewKey.INDEX)
    .filter((view) => !viewIdsAlreadyAdded.has(view.id))
    .filter(isViewDisplayableInNavigationMenu);

  const objectMetadataIdsWithDisplayableViews = new Set(
    availableViews.map((view) => view.objectMetadataId),
  );

  const {
    availableObjectMetadataItems,
    availableSystemObjectMetadataItems,
    objectMetadataItemsWithViews,
    availableSystemObjectMetadataItemsForView,
  } = getAvailableObjectMetadataForNewSidebarItem({
    objectMetadataItems,
    activeNonSystemObjectMetadataItems,
    objectMetadataIdsWithIndexView,
    objectMetadataIdsWithDisplayableViews,
  });

  const searchableObjectMetadataItems = [
    ...availableObjectMetadataItems,
    ...availableSystemObjectMetadataItems,
  ].toSorted((a, b) => a.labelPlural.localeCompare(b.labelPlural));

  const searchableObjectMetadataItemsWithViews = [
    ...objectMetadataItemsWithViews,
    ...availableSystemObjectMetadataItemsForView,
  ];

  const filteredObjectMetadataItems = filterBySearchQuery({
    items: searchableObjectMetadataItems,
    searchQuery: trimmedSearchValue,
    getSearchableValues: (item) => [
      item.labelPlural,
      item.labelSingular,
      item.namePlural,
      item.nameSingular,
    ],
  });

  const objectMetadataItemIdsWithViews = new Set(
    searchableObjectMetadataItemsWithViews.map((item) => item.id),
  );

  const filteredViews = filterBySearchQuery({
    items: availableViews
      .filter((view) =>
        objectMetadataItemIdsWithViews.has(view.objectMetadataId),
      )
      .sort((viewA, viewB) => viewA.name.localeCompare(viewB.name)),
    searchQuery: trimmedSearchValue,
    getSearchableValues: (view) => [view.name],
  });

  const selectableItemIds = [
    ...filteredObjectMetadataItems.map((item) => item.id),
    ...filteredViews.map((view) => view.id),
    ...availableSearchRecords.map((record) => record.recordId),
  ];

  const isEmpty =
    filteredObjectMetadataItems.length === 0 &&
    filteredViews.length === 0 &&
    availableSearchRecords.length === 0 &&
    !isRecordSearchLoading;

  const handleSelectObject = (
    objectMetadataItem: EnrichedObjectMetadataItem,
  ) => {
    const itemId = createItem(
      {
        type: NavigationMenuItemType.OBJECT,
        targetObjectMetadataId: objectMetadataItem.id,
        color: getObjectColorWithFallback(objectMetadataItem),
      },
      {
        targetFolderId: pendingInsertionNavigationMenuItem?.folderId,
        targetIndex: pendingInsertionNavigationMenuItem?.position,
      },
    );

    setPendingInsertionNavigationMenuItem(null);
    openNavigationMenuItemInSidePanel({
      itemId,
      pageTitle: objectMetadataItem.labelSingular,
      pageIcon: getIcon(objectMetadataItem.icon),
    });
  };

  const handleSelectView = (view: View) => {
    const objectMetadataItem = objectMetadataItems.find(
      (item) => item.id === view.objectMetadataId,
    );
    const viewIconColor = isDefined(objectMetadataItem)
      ? getObjectColorWithFallback(objectMetadataItem)
      : undefined;

    const itemId = createItem(
      {
        type: NavigationMenuItemType.VIEW,
        viewId: view.id,
        color: viewIconColor,
      },
      {
        targetFolderId: pendingInsertionNavigationMenuItem?.folderId ?? null,
        targetIndex: pendingInsertionNavigationMenuItem?.position,
      },
    );

    setPendingInsertionNavigationMenuItem(null);
    openNavigationMenuItemInSidePanel({
      itemId,
      pageTitle: view.name,
      pageIcon: getIcon(view.icon),
    });
  };

  const getObjectMetadataItemForView = (view: View) =>
    objectMetadataItems.find((item) => item.id === view.objectMetadataId);

  return (
    <SidePanelAddToNavigationDroppable>
      {({ innerRef, droppableProps, placeholder }) => (
        <SidePanelList
          selectableItemIds={selectableItemIds}
          loading={isRecordSearchLoading}
          noResults={isEmpty}
          noResultsText={t`No results found`}
        >
          {/* oxlint-disable-next-line react/jsx-props-no-spreading */}
          <div ref={innerRef} {...droppableProps}>
            <SidePanelGroup heading={t`Objects`}>
              {filteredObjectMetadataItems.map((objectMetadataItem, index) => (
                <SidePanelObjectMenuItem
                  key={objectMetadataItem.id}
                  objectMetadataItem={objectMetadataItem}
                  onSelect={handleSelectObject}
                  variant="add"
                  dragIndex={index}
                />
              ))}
            </SidePanelGroup>
            <SidePanelGroup heading={t`Views`}>
              {filteredViews.map((view, index) => {
                const objectMetadataItem = getObjectMetadataItemForView(view);
                const objectIconColor = isDefined(objectMetadataItem)
                  ? getObjectColorWithFallback(objectMetadataItem)
                  : undefined;

                return (
                  <SelectableListItem
                    key={view.id}
                    itemId={view.id}
                    onEnter={() => handleSelectView(view)}
                  >
                    <SidePanelItemWithAddToNavigationDrag
                      customIconContent={
                        isDefined(objectMetadataItem) ? (
                          <ObjectIconWithViewOverlay
                            ObjectIcon={getIcon(objectMetadataItem.icon)}
                            ViewIcon={getIcon(view.icon)}
                            objectColor={objectIconColor}
                          />
                        ) : undefined
                      }
                      icon={
                        isDefined(objectMetadataItem)
                          ? undefined
                          : getIcon(view.icon)
                      }
                      label={view.name}
                      id={view.id}
                      onClick={() => handleSelectView(view)}
                      dragIndex={filteredObjectMetadataItems.length + index}
                      payload={{
                        type: NavigationMenuItemType.VIEW,
                        viewId: view.id,
                        label: view.name,
                      }}
                    />
                  </SelectableListItem>
                );
              })}
            </SidePanelGroup>
            <SidePanelGroup heading={t`Records`}>
              {availableSearchRecords.map((record, index) => (
                <SidePanelNewSidebarItemRecordItem
                  key={record.recordId}
                  record={record}
                  dragIndex={
                    filteredObjectMetadataItems.length +
                    filteredViews.length +
                    index
                  }
                />
              ))}
            </SidePanelGroup>
            {placeholder}
          </div>
        </SidePanelList>
      )}
    </SidePanelAddToNavigationDroppable>
  );
};
