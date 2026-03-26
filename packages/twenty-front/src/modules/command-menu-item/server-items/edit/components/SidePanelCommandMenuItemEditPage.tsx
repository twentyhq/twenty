import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { useCommandMenuItemsDraftState } from '@/command-menu-item/server-items/common/hooks/useCommandMenuItemsDraftState';
import { commandMenuItemsSelector } from '@/command-menu-item/server-items/common/states/commandMenuItemsSelector';
import { CommandMenuItemDraggable } from '@/command-menu-item/server-items/edit/components/CommandMenuItemDraggable';
import { CommandMenuItemEditRecordSelectionDropdown } from '@/command-menu-item/server-items/edit/components/CommandMenuItemEditRecordSelectionDropdown';
import { CommandMenuItemOptionsDropdown } from '@/command-menu-item/server-items/edit/components/CommandMenuItemOptionsDropdown';
import { useCommandMenuContextApiForEdition } from '@/command-menu-item/server-items/edit/hooks/useCommandMenuContextApiForEdition';
import { useReorderCommandMenuItemsInDraft } from '@/command-menu-item/server-items/edit/hooks/useReorderCommandMenuItemsInDraft';
import { useResetCommandMenuItemsDraft } from '@/command-menu-item/server-items/edit/hooks/useResetCommandMenuItemsDraft';
import { useUpdateCommandMenuItemInDraft } from '@/command-menu-item/server-items/edit/hooks/useUpdateCommandMenuItemInDraft';
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
import { useContext } from 'react';
import { CommandMenuContextApiPageType } from 'twenty-shared/types';
import {
  interpolateCommandMenuItemLabel,
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
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

const partitionByPinned = (items: CommandMenuItemFieldsFragment[]) => {
  const pinned = items
    .filter((item) => item.isPinned)
    .sort((a, b) => a.position - b.position);
  const other = items
    .filter((item) => !item.isPinned)
    .sort((a, b) => a.position - b.position);

  return { pinned, other };
};

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
  const { commandMenuItems: commandMenuItemsInCurrentContext } =
    useContext(CommandMenuContext);
  const commandMenuContextApi = useCommandMenuContextApiForEdition();

  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);

  const commandMenuItems = useAtomStateValue(commandMenuItemsSelector);
  const serverItemsById = new Map(
    commandMenuItems.map((item) => [item.id, item]),
  );
  const { commandMenuItems: commandMenuItemsDraft } =
    useCommandMenuItemsDraftState();
  const { updateCommandMenuItemInDraft } = useUpdateCommandMenuItemInDraft();
  const { reorderCommandMenuItemInDraft } = useReorderCommandMenuItemsInDraft();
  const { resetCommandMenuItemsDraft } = useResetCommandMenuItemsDraft();

  const getDisplayLabel = (item: CommandMenuItemFieldsFragment) =>
    interpolateCommandMenuItemLabel({
      label: item.label,
      context: commandMenuContextApi,
    }) ?? item.label;

  const contextualCommandMenuItemIds = new Set(
    commandMenuItemsInCurrentContext.map((item) => item.id).filter(isDefined),
  );

  const contextualCommandMenuItems = commandMenuItemsDraft.filter((item) =>
    contextualCommandMenuItemIds.has(item.id),
  );

  const {
    pinned: allPinnedContextualCommandMenuItems,
    other: allOtherContextualCommandMenuItems,
  } = partitionByPinned(contextualCommandMenuItems);

  const normalizedSearch =
    sidePanelSearch.length > 0
      ? normalizeSearchText(sidePanelSearch)
      : undefined;

  const matchesSearch = (item: CommandMenuItemFieldsFragment) =>
    normalizedSearch === undefined ||
    normalizeSearchText(getDisplayLabel(item)).includes(normalizedSearch);

  const displayedPinnedContextualCommandMenuItems =
    allPinnedContextualCommandMenuItems.filter(matchesSearch);
  const displayedOtherContextualCommandMenuItems =
    allOtherContextualCommandMenuItems.filter(matchesSearch);

  const selectableItemIds = [
    ...displayedPinnedContextualCommandMenuItems.map((item) => item.id),
    ...displayedOtherContextualCommandMenuItems.map((item) => item.id),
  ];

  const handleTogglePin = (itemId: string, currentlyPinned: boolean) => {
    if (currentlyPinned) {
      const nextOtherPosition =
        allOtherContextualCommandMenuItems.length === 0
          ? 0
          : allOtherContextualCommandMenuItems[
              allOtherContextualCommandMenuItems.length - 1
            ].position + 1;

      updateCommandMenuItemInDraft(itemId, {
        isPinned: false,
        position: nextOtherPosition,
      });

      return;
    }

    const nextPinnedPosition =
      allPinnedContextualCommandMenuItems.length === 0
        ? 0
        : allPinnedContextualCommandMenuItems[
            allPinnedContextualCommandMenuItems.length - 1
          ].position + 1;

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

    const displayedPinnedItemIdsWithoutSource =
      displayedPinnedContextualCommandMenuItems
        .map((item) => item.id)
        .filter((itemId) => itemId !== draggableId);

    const allPinnedItemsWithoutSource =
      allPinnedContextualCommandMenuItems.filter(
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
      contextualCommandMenuItemIds,
    );
  };

  const isIndexPage =
    commandMenuContextApi.pageType === CommandMenuContextApiPageType.INDEX_PAGE;

  return (
    <StyledContainer data-click-outside-id={COMMAND_MENU_CLICK_OUTSIDE_ID}>
      {isIndexPage && (
        <StyledViewbar>
          <CommandMenuItemEditRecordSelectionDropdown />
        </StyledViewbar>
      )}
      <StyledContent>
        <SidePanelList commandGroups={[]} selectableItemIds={selectableItemIds}>
          <SidePanelGroup heading={t`Pinned`}>
            <DraggableList
              onDragEnd={handlePinnedDragEnd}
              draggableItems={displayedPinnedContextualCommandMenuItems.map(
                (item, index) => {
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
                          <CommandMenuItemDraggable
                            label={getDisplayLabel(item)}
                            Icon={ItemIcon}
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
                },
              )}
            />
          </SidePanelGroup>

          <SidePanelGroup heading={t`Other`}>
            {displayedOtherContextualCommandMenuItems.map((item) => {
              const ItemIcon = isDefined(item.icon)
                ? getIcon(item.icon)
                : undefined;

              return (
                <SelectableListItem
                  key={item.id}
                  itemId={item.id}
                  onEnter={() => handleTogglePin(item.id, false)}
                >
                  <CommandMenuItemDraggable
                    label={getDisplayLabel(item)}
                    Icon={ItemIcon}
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
