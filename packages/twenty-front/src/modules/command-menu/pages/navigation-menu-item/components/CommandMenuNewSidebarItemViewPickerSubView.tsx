import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuAddToNavDroppable } from '@/command-menu/components/CommandMenuAddToNavDroppable';
import { CommandMenuItemWithAddToNavigationDrag } from '@/command-menu/components/CommandMenuItemWithAddToNavigationDrag';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { CommandMenuSubViewWithSearch } from '@/command-menu/components/CommandMenuSubViewWithSearch';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useFilteredPickerItems } from '@/command-menu/hooks/useFilteredPickerItems';
import { ObjectIconWithViewOverlay } from '@/navigation-menu-item/components/ObjectIconWithViewOverlay';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { useAddViewToNavigationMenuDraft } from '@/navigation-menu-item/hooks/useAddViewToNavigationMenuDraft';
import { useDraftNavigationMenuItems } from '@/navigation-menu-item/hooks/useDraftNavigationMenuItems';
import { useNavigationMenuObjectMetadataFromDraft } from '@/navigation-menu-item/hooks/useNavigationMenuObjectMetadataFromDraft';
import { addMenuItemInsertionContextState } from '@/navigation-menu-item/states/addMenuItemInsertionContextState';
import { getStandardObjectIconColor } from '@/navigation-menu-item/utils/getStandardObjectIconColor';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type View } from '@/views/types/View';
import { ViewKey } from '@/views/types/ViewKey';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

type CommandMenuNewSidebarItemViewPickerSubViewProps = {
  selectedObjectMetadataIdForView: string;
  onBack: () => void;
};

export const CommandMenuNewSidebarItemViewPickerSubView = ({
  selectedObjectMetadataIdForView,
  onBack,
}: CommandMenuNewSidebarItemViewPickerSubViewProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const [searchValue, setSearchValue] = useState('');
  const { closeCommandMenu } = useCommandMenu();
  const { addViewToDraft } = useAddViewToNavigationMenuDraft();
  const { currentDraft } = useDraftNavigationMenuItems();
  const addMenuItemInsertionContext = useAtomStateValue(
    addMenuItemInsertionContextState,
  );
  const setAddMenuItemInsertionContext = useSetAtomState(
    addMenuItemInsertionContextState,
  );
  const { objectMetadataItems } = useObjectMetadataItems();
  const { views } = useNavigationMenuObjectMetadataFromDraft(currentDraft);

  const viewsForSelectedObject = views
    .filter(
      (view) =>
        view.objectMetadataId === selectedObjectMetadataIdForView &&
        view.key !== ViewKey.Index,
    )
    .sort((a, b) => a.position - b.position);

  const selectedObjectMetadataItem = objectMetadataItems.find(
    (item) => item.id === selectedObjectMetadataIdForView,
  );
  const backBarTitle =
    selectedObjectMetadataItem?.labelPlural ?? t`Pick a view`;

  const {
    filteredItems: filteredViews,
    selectableItemIds,
    isEmpty,
    hasSearchQuery,
  } = useFilteredPickerItems({
    items: viewsForSelectedObject,
    searchQuery: searchValue,
    getSearchableValues: (view) => [view.name],
  });
  const noResultsText = hasSearchQuery
    ? t`No results found`
    : t`No custom views available`;

  const handleSelectView = (view: View) => {
    addViewToDraft(
      view.id,
      currentDraft,
      addMenuItemInsertionContext?.targetFolderId ?? null,
      addMenuItemInsertionContext?.targetIndex,
      isDefined(selectedObjectMetadataItem)
        ? getStandardObjectIconColor(selectedObjectMetadataItem.nameSingular)
        : undefined,
    );
    setAddMenuItemInsertionContext(null);
    closeCommandMenu();
  };

  return (
    <CommandMenuSubViewWithSearch
      backBarTitle={backBarTitle}
      onBack={onBack}
      searchPlaceholder={t`Search a view...`}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
    >
      <CommandMenuAddToNavDroppable>
        {({ innerRef, droppableProps, placeholder }) => (
          <CommandMenuList
            commandGroups={[]}
            selectableItemIds={selectableItemIds}
            noResults={isEmpty}
            noResultsText={noResultsText}
          >
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <div ref={innerRef} {...droppableProps}>
              <CommandGroup heading={t`Views`}>
                {filteredViews.map((view, index) => (
                  <SelectableListItem
                    key={view.id}
                    itemId={view.id}
                    onEnter={() => handleSelectView(view)}
                  >
                    <CommandMenuItemWithAddToNavigationDrag
                      customIconContent={
                        selectedObjectMetadataItem ? (
                          <ObjectIconWithViewOverlay
                            ObjectIcon={getIcon(
                              selectedObjectMetadataItem.icon,
                            )}
                            ViewIcon={getIcon(view.icon)}
                            objectColor={getStandardObjectIconColor(
                              selectedObjectMetadataItem.nameSingular,
                            )}
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
              </CommandGroup>
              {placeholder}
            </div>
          </CommandMenuList>
        )}
      </CommandMenuAddToNavDroppable>
    </CommandMenuSubViewWithSearch>
  );
};
