import { useCommandMenuContextApi } from '@/command-menu-item/hooks/useCommandMenuContextApi';
import { commandMenuItemsSelector } from '@/command-menu-item/states/commandMenuItemsSelector';
import { doesCommandMenuItemMatchObjectMetadataId } from '@/command-menu-item/utils/doesCommandMenuItemMatchObjectMetadataId';
import { groupCommandMenuItems } from '@/command-menu-item/utils/groupCommandMenuItems';
import { CommandMenuItemEditRecordSelectionDropdown } from '@/command-menu-item/edit/components/CommandMenuItemEditRecordSelectionDropdown';
import { CommandMenuItemOptionsDropdown } from '@/command-menu-item/edit/components/CommandMenuItemOptionsDropdown';
import { useReorderCommandMenuItemsInDraft } from '@/command-menu-item/edit/hooks/useReorderCommandMenuItemsInDraft';
import { useResetCommandMenuItemsDraft } from '@/command-menu-item/edit/hooks/useResetCommandMenuItemsDraft';
import { useUpdateCommandMenuItemInDraft } from '@/command-menu-item/edit/hooks/useUpdateCommandMenuItemInDraft';
import { commandMenuItemsDraftState } from '@/command-menu-item/edit/states/commandMenuItemsDraftState';
import { mainContextStoreHasSelectedRecordsSelector } from '@/context-store/states/selectors/mainContextStoreHasSelectedRecordsSelector';
import { COMMAND_MENU_CLICK_OUTSIDE_ID } from '@/command-menu/constants/CommandMenuClickOutsideId';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type DropResult } from '@hello-pangea/dnd';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { CommandMenuContextApiPageType } from 'twenty-shared/types';
import {
  interpolateCommandMenuItemTemplate,
  isDefined,
} from 'twenty-shared/utils';
import {
  IconDotsVertical,
  IconPin,
  IconPinnedOff,
  IconRefresh,
  useIcons,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { MenuItem, MenuItemDraggable } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  CommandMenuItemAvailabilityType,
  type CommandMenuItemFieldsFragment,
} from '~/generated-metadata/graphql';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledViewbar = styled.div`
  align-items: center;
  backdrop-filter: blur(5px);
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-shrink: 0;
  height: 40px;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledContent = styled.div`
  flex: 1;
  overflow: auto;
`;

export const SidePanelCommandMenuItemEditPage = () => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const commandMenuContextApi = useCommandMenuContextApi();

  const currentObjectMetadataItemId =
    commandMenuContextApi.objectMetadataItem.id;

  const isRecordPage =
    commandMenuContextApi.pageType ===
    CommandMenuContextApiPageType.RECORD_PAGE;

  const mainContextStoreHasSelectedRecords = useAtomStateValue(
    mainContextStoreHasSelectedRecordsSelector,
  );

  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);

  const commandMenuItems = useAtomStateValue(commandMenuItemsSelector);
  const serverItemsById = new Map(
    commandMenuItems.map((item) => [item.id, item]),
  );
  const commandMenuItemsDraft =
    useAtomStateValue(commandMenuItemsDraftState) ?? [];
  const { updateCommandMenuItemInDraft } = useUpdateCommandMenuItemInDraft();
  const { reorderCommandMenuItemInDraft } = useReorderCommandMenuItemsInDraft();
  const { resetCommandMenuItemsDraft } = useResetCommandMenuItemsDraft();

  const allowedAvailabilityTypes = new Set<CommandMenuItemAvailabilityType>([
    CommandMenuItemAvailabilityType.GLOBAL,
    mainContextStoreHasSelectedRecords
      ? CommandMenuItemAvailabilityType.RECORD_SELECTION
      : CommandMenuItemAvailabilityType.FALLBACK,
  ]);

  const filteredCommandMenuItems = commandMenuItemsDraft
    .filter(
      doesCommandMenuItemMatchObjectMetadataId(currentObjectMetadataItemId),
    )
    .filter((item) => allowedAvailabilityTypes.has(item.availabilityType))
    .sort((firstItem, secondItem) => firstItem.position - secondItem.position);

  const filteredCommandMenuItemIds = new Set(
    filteredCommandMenuItems.map((item) => item.id),
  );

  const getDisplayLabel = (item: CommandMenuItemFieldsFragment) =>
    interpolateCommandMenuItemTemplate({
      label: item.label,
      context: commandMenuContextApi,
    }) ?? item.label;

  const { pinned: allPinnedItems, other: allOtherItems } =
    groupCommandMenuItems(filteredCommandMenuItems);

  const normalizedSearch =
    sidePanelSearch.length > 0
      ? normalizeSearchText(sidePanelSearch)
      : undefined;

  const matchesSearch = (item: CommandMenuItemFieldsFragment) =>
    normalizedSearch === undefined ||
    normalizeSearchText(getDisplayLabel(item)).includes(normalizedSearch);

  const displayedPinnedItems = allPinnedItems.filter(matchesSearch);
  const displayedOtherItems = allOtherItems.filter(matchesSearch);

  const selectableItemIds = [
    ...displayedPinnedItems.map((item) => item.id),
    ...displayedOtherItems.map((item) => item.id),
  ];

  const handleTogglePin = (itemId: string, currentlyPinned: boolean) => {
    if (currentlyPinned) {
      const nextOtherPosition =
        allOtherItems.length === 0
          ? 0
          : allOtherItems[allOtherItems.length - 1].position + 1;

      updateCommandMenuItemInDraft(itemId, {
        isPinned: false,
        position: nextOtherPosition,
      });

      return;
    }

    const nextPinnedPosition =
      allPinnedItems.length === 0
        ? 0
        : allPinnedItems[allPinnedItems.length - 1].position + 1;

    updateCommandMenuItemInDraft(itemId, {
      isPinned: true,
      position: nextPinnedPosition,
    });
  };

  const makeOptionsDropdownWrapper =
    (item: Pick<CommandMenuItemFieldsFragment, 'id' | 'shortLabel'>) =>
    ({ iconButton }: { iconButton: React.ReactElement }) => (
      <CommandMenuItemOptionsDropdown
        itemId={item.id}
        shortLabel={item.shortLabel}
        serverShortLabel={serverItemsById.get(item.id)?.shortLabel ?? null}
        iconButton={iconButton}
      />
    );

  const handlePinnedDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!isDefined(destination)) {
      return;
    }

    if (source.index === destination.index) {
      return;
    }

    const displayedPinnedItemIdsWithoutSource = displayedPinnedItems
      .map((item) => item.id)
      .filter((itemId) => itemId !== draggableId);

    const allPinnedItemsWithoutSource = allPinnedItems.filter(
      (item) => item.id !== draggableId,
    );

    const nextDisplayedPinnedItemId =
      displayedPinnedItemIdsWithoutSource[destination.index];
    const previousDisplayedPinnedItemId =
      displayedPinnedItemIdsWithoutSource[destination.index - 1];

    let destinationIndexInAllPinnedItemsWithoutSource: number;

    if (isDefined(nextDisplayedPinnedItemId)) {
      destinationIndexInAllPinnedItemsWithoutSource =
        allPinnedItemsWithoutSource.findIndex(
          (item) => item.id === nextDisplayedPinnedItemId,
        );
    } else if (isDefined(previousDisplayedPinnedItemId)) {
      const previousIndex = allPinnedItemsWithoutSource.findIndex(
        (item) => item.id === previousDisplayedPinnedItemId,
      );

      if (previousIndex === -1) {
        return;
      }

      destinationIndexInAllPinnedItemsWithoutSource = previousIndex + 1;
    } else {
      return;
    }

    if (destinationIndexInAllPinnedItemsWithoutSource === -1) {
      return;
    }

    reorderCommandMenuItemInDraft(
      draggableId,
      destinationIndexInAllPinnedItemsWithoutSource,
      'pinned',
      filteredCommandMenuItemIds,
    );
  };

  return (
    <StyledContainer data-click-outside-id={COMMAND_MENU_CLICK_OUTSIDE_ID}>
      <StyledViewbar>
        <CommandMenuItemEditRecordSelectionDropdown
          isRecordPage={isRecordPage}
        />
      </StyledViewbar>
      <StyledContent>
        <SidePanelList selectableItemIds={selectableItemIds}>
          <SidePanelGroup heading={t`Pinned`}>
            <DraggableList
              onDragEnd={handlePinnedDragEnd}
              draggableItems={displayedPinnedItems.map((item, index) => {
                const ItemIcon = isDefined(item.icon)
                  ? getIcon(item.icon)
                  : undefined;

                return (
                  <DraggableItem
                    key={item.id}
                    draggableId={item.id}
                    index={index}
                    itemComponent={
                      <SelectableListItem
                        itemId={item.id}
                        onEnter={() => handleTogglePin(item.id, true)}
                      >
                        <MenuItemDraggable
                          withIconContainer
                          LeftIcon={ItemIcon}
                          text={getDisplayLabel(item)}
                          gripMode="onHover"
                          isIconDisplayedOnHoverOnly={false}
                          iconButtons={[
                            {
                              Icon: IconPinnedOff,
                              onClick: (event) => {
                                event.stopPropagation();
                                handleTogglePin(item.id, true);
                              },
                            },
                            {
                              Icon: IconDotsVertical,
                              Wrapper: makeOptionsDropdownWrapper(item),
                              onClick: () => {},
                            },
                          ]}
                        />
                      </SelectableListItem>
                    }
                  />
                );
              })}
            />
          </SidePanelGroup>

          <SidePanelGroup heading={t`Other`}>
            {displayedOtherItems.map((item) => {
              const ItemIcon = isDefined(item.icon)
                ? getIcon(item.icon)
                : undefined;

              return (
                <SelectableListItem
                  key={item.id}
                  itemId={item.id}
                  onEnter={() => handleTogglePin(item.id, false)}
                >
                  <MenuItem
                    withIconContainer
                    LeftIcon={ItemIcon}
                    text={getDisplayLabel(item)}
                    isIconDisplayedOnHoverOnly={false}
                    iconButtons={[
                      {
                        Icon: IconPin,
                        onClick: (event) => {
                          event.stopPropagation();
                          handleTogglePin(item.id, false);
                        },
                      },
                    ]}
                  />
                </SelectableListItem>
              );
            })}
          </SidePanelGroup>
        </SidePanelList>
      </StyledContent>
      <SidePanelFooter
        actions={[
          <Button
            key="reset"
            Icon={IconRefresh}
            title={t`Reset to default`}
            variant="secondary"
            accent="default"
            size="small"
            onClick={resetCommandMenuItemsDraft}
          />,
        ]}
      />
    </StyledContainer>
  );
};
