import { ObjectIconWithViewOverlay } from '@/navigation-menu-item/components/ObjectIconWithViewOverlay';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { useAddViewToNavigationMenuDraft } from '@/navigation-menu-item/hooks/useAddViewToNavigationMenuDraft';
import { useDraftNavigationMenuItems } from '@/navigation-menu-item/hooks/useDraftNavigationMenuItems';
import { useNavigationMenuObjectMetadataFromDraft } from '@/navigation-menu-item/hooks/useNavigationMenuObjectMetadataFromDraft';
import { useOpenNavigationMenuItemInSidePanel } from '@/navigation-menu-item/hooks/useOpenNavigationMenuItemInSidePanel';
import { addMenuItemInsertionContextState } from '@/navigation-menu-item/states/addMenuItemInsertionContextState';
import { getStandardObjectIconColor } from '@/navigation-menu-item/utils/getStandardObjectIconColor';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { SidePanelAddToNavigationDroppable } from '@/side-panel/components/SidePanelAddToNavigationDroppable';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelItemWithAddToNavigationDrag } from '@/side-panel/components/SidePanelItemWithAddToNavigationDrag';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SidePanelSubViewWithSearch } from '@/side-panel/components/SidePanelSubViewWithSearch';
import { useSidePanelFilteredPickerItems } from '@/side-panel/hooks/useSidePanelFilteredPickerItems';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type View } from '@/views/types/View';
import { ViewKey } from '@/views/types/ViewKey';
import { ViewType } from '@/views/types/ViewType';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { ViewVisibility } from '~/generated-metadata/graphql';

type SidePanelNewSidebarItemViewPickerSubViewProps = {
  selectedObjectMetadataIdForView: string;
  onBack: () => void;
};

export const SidePanelNewSidebarItemViewPickerSubView = ({
  selectedObjectMetadataIdForView,
  onBack,
}: SidePanelNewSidebarItemViewPickerSubViewProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const [searchValue, setSearchValue] = useState('');
  const { addViewToDraft } = useAddViewToNavigationMenuDraft();
  const { currentDraft } = useDraftNavigationMenuItems();
  const addMenuItemInsertionContext = useAtomStateValue(
    addMenuItemInsertionContextState,
  );
  const setAddMenuItemInsertionContext = useSetAtomState(
    addMenuItemInsertionContextState,
  );
  const { openNavigationMenuItemInSidePanel } =
    useOpenNavigationMenuItemInSidePanel();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { views } = useNavigationMenuObjectMetadataFromDraft(currentDraft);

  const viewsForSelectedObject = views
    .filter(
      (view) =>
        view.objectMetadataId === selectedObjectMetadataIdForView &&
        view.key !== ViewKey.Index &&
        view.type !== ViewType.FieldsWidget &&
        view.visibility === ViewVisibility.WORKSPACE,
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
  } = useSidePanelFilteredPickerItems({
    items: viewsForSelectedObject,
    searchQuery: searchValue,
    getSearchableValues: (view) => [view.name],
  });
  const noResultsText = hasSearchQuery
    ? t`No results found`
    : t`No custom views available`;

  const isDragDisabled = addMenuItemInsertionContext?.disableDrag === true;

  const handleSelectView = (view: View) => {
    const itemId = addViewToDraft(
      view.id,
      currentDraft,
      addMenuItemInsertionContext?.targetFolderId ?? null,
      addMenuItemInsertionContext?.targetIndex,
      isDefined(selectedObjectMetadataItem)
        ? getStandardObjectIconColor(selectedObjectMetadataItem.nameSingular)
        : undefined,
    );
    setAddMenuItemInsertionContext(null);
    openNavigationMenuItemInSidePanel({
      itemId,
      pageTitle: view.name,
      pageIcon: getIcon(view.icon),
    });
  };

  return (
    <SidePanelSubViewWithSearch
      backBarTitle={backBarTitle}
      onBack={onBack}
      searchPlaceholder={t`Search a view...`}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
    >
      <SidePanelAddToNavigationDroppable>
        {({ innerRef, droppableProps, placeholder }) => (
          <SidePanelList
            commandGroups={[]}
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
                      dragIndex={isDragDisabled ? undefined : index}
                      disableDrag={isDragDisabled}
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
