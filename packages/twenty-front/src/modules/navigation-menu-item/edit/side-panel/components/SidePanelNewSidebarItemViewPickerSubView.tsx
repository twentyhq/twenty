import { ObjectIconWithViewOverlay } from '@/navigation-menu-item/display/view/components/ObjectIconWithViewOverlay';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { useAddViewToNavigationMenuDraft } from '@/navigation-menu-item/edit/view/hooks/useAddViewToNavigationMenuDraft';
import { useDraftNavigationMenuItems } from '@/navigation-menu-item/edit/hooks/useDraftNavigationMenuItems';
import { useNavigationMenuObjectMetadataFromDraft } from '@/navigation-menu-item/edit/hooks/useNavigationMenuObjectMetadataFromDraft';
import { useOpenNavigationMenuItemInSidePanel } from '@/navigation-menu-item/edit/hooks/useOpenNavigationMenuItemInSidePanel';
import { isViewDisplayableInNavigationMenu } from '@/navigation-menu-item/edit/side-panel/utils/isViewDisplayableInNavigationMenu';
import { pendingInsertionNavigationMenuItemState } from '@/navigation-menu-item/common/states/pendingInsertionNavigationMenuItemState';
import { getObjectColorWithFallback } from '@/object-metadata/utils/getObjectColorWithFallback';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { SidePanelAddToNavigationDroppable } from '@/side-panel/components/SidePanelAddToNavigationDroppable';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelItemWithAddToNavigationDrag } from '@/side-panel/components/SidePanelItemWithAddToNavigationDrag';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SidePanelSubViewWithSearch } from '@/side-panel/components/SidePanelSubViewWithSearch';
import { useSidePanelFilteredPickerItems } from '@/side-panel/hooks/useSidePanelFilteredPickerItems';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { type View } from '@/views/types/View';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

type SidePanelNewSidebarItemViewPickerSubViewProps = {
  selectedObjectMetadataIdForView: string;
};

export const SidePanelNewSidebarItemViewPickerSubView = ({
  selectedObjectMetadataIdForView,
}: SidePanelNewSidebarItemViewPickerSubViewProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const [searchValue, setSearchValue] = useState('');
  const { addViewToDraft } = useAddViewToNavigationMenuDraft();
  const { currentDraft } = useDraftNavigationMenuItems();
  const [
    pendingInsertionNavigationMenuItem,
    setPendingInsertionNavigationMenuItem,
  ] = useAtomState(pendingInsertionNavigationMenuItemState);
  const { openNavigationMenuItemInSidePanel } =
    useOpenNavigationMenuItemInSidePanel();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { views } = useNavigationMenuObjectMetadataFromDraft(currentDraft);

  const viewsForSelectedObject = views
    .filter(
      (view) =>
        view.objectMetadataId === selectedObjectMetadataIdForView &&
        isViewDisplayableInNavigationMenu(view),
    )
    .sort((a, b) => a.position - b.position);

  const selectedObjectMetadataItem = objectMetadataItems.find(
    (item) => item.id === selectedObjectMetadataIdForView,
  );

  const {
    filteredItems: filteredViews,
    selectableItemIds,
    isEmpty,
    hasSearchQuery,
  } = useSidePanelFilteredPickerItems({
    items: viewsForSelectedObject,
    searchQuery: searchValue,
    getSearchableValues: (view) => [view.name],
  });
  const noResultsText = hasSearchQuery
    ? t`No results found`
    : t`No custom views available`;

  const selectedObjectIconColor = isDefined(selectedObjectMetadataItem)
    ? getObjectColorWithFallback(selectedObjectMetadataItem)
    : undefined;

  const handleSelectView = (view: View) => {
    const itemId = addViewToDraft(
      view.id,
      currentDraft,
      pendingInsertionNavigationMenuItem?.folderId ?? null,
      pendingInsertionNavigationMenuItem?.position,
      selectedObjectIconColor,
    );
    setPendingInsertionNavigationMenuItem(null);
    openNavigationMenuItemInSidePanel({
      itemId,
      pageTitle: view.name,
      pageIcon: getIcon(view.icon),
    });
  };

  return (
    <SidePanelSubViewWithSearch
      searchPlaceholder={t`Search a view...`}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
    >
      <SidePanelAddToNavigationDroppable>
        {({ innerRef, droppableProps, placeholder }) => (
          <SidePanelList
            selectableItemIds={selectableItemIds}
            noResults={isEmpty}
            noResultsText={noResultsText}
          >
            {/* oxlint-disable-next-line react/jsx-props-no-spreading */}
            <div ref={innerRef} {...droppableProps}>
              <SidePanelGroup heading={t`Views`}>
                {filteredViews.map((view, index) => (
                  <SelectableListItem
                    key={view.id}
                    itemId={view.id}
                    onEnter={() => handleSelectView(view)}
                  >
                    <SidePanelItemWithAddToNavigationDrag
                      customIconContent={
                        selectedObjectMetadataItem ? (
                          <ObjectIconWithViewOverlay
                            ObjectIcon={getIcon(
                              selectedObjectMetadataItem.icon,
                            )}
                            ViewIcon={getIcon(view.icon)}
                            objectColor={selectedObjectIconColor}
                          />
                        ) : undefined
                      }
                      icon={
                        selectedObjectMetadataItem
                          ? undefined
                          : getIcon(view.icon)
                      }
                      label={view.name}
                      id={view.id}
                      onClick={() => handleSelectView(view)}
                      dragIndex={index}
                      payload={{
                        type: NavigationMenuItemType.VIEW,
                        viewId: view.id,
                        label: view.name,
                      }}
                    />
                  </SelectableListItem>
                ))}
              </SidePanelGroup>
              {placeholder}
            </div>
          </SidePanelList>
        )}
      </SidePanelAddToNavigationDroppable>
    </SidePanelSubViewWithSearch>
  );
};
