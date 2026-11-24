import { useStore } from 'jotai';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';

import { type CommandMenuCollapsibleSectionNavigation } from '@/command-menu-item/types/CommandMenuCollapsibleSectionNavigation';
import { type CommandMenuItemSection } from '@/command-menu-item/types/CommandMenuItemSection';
import { getCommandMenuSectionKeyboardAction } from '@/command-menu-item/utils/getCommandMenuSectionKeyboardAction';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { SIDE_PANEL_SELECTABLE_LIST_ID } from '@/side-panel/constants/SidePanelSelectableListId';
import { hasUserSelectedSidePanelListItemState } from '@/side-panel/states/hasUserSelectedSidePanelListItemState';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';

export const useCommandMenuCollapsibleSectionHotkeys = ({
  collapsibleSections,
  setSectionOpen,
}: {
  collapsibleSections: CommandMenuCollapsibleSectionNavigation[];
  setSectionOpen: (sectionToggle: {
    section: CommandMenuItemSection;
    isOpen: boolean;
  }) => void;
}) => {
  const store = useStore();
  const { setSelectedItemId } = useSelectableList(
    SIDE_PANEL_SELECTABLE_LIST_ID,
  );

  const handleArrowKey =
    (key: 'ArrowLeft' | 'ArrowRight') => (keyboardEvent: KeyboardEvent) => {
      if (!store.get(hasUserSelectedSidePanelListItemState.atom)) {
        return;
      }

      const action = getCommandMenuSectionKeyboardAction({
        key,
        selectedItemId: store.get(
          selectedItemIdComponentState.atomFamily({
            instanceId: SIDE_PANEL_SELECTABLE_LIST_ID,
          }),
        ),
        collapsibleSections,
      });

      if (!isDefined(action)) {
        return;
      }

      keyboardEvent.preventDefault();
      setSectionOpen({ section: action.section, isOpen: action.isOpen });

      if (isDefined(action.itemIdToSelect)) {
        setSelectedItemId(action.itemIdToSelect);
        store.set(hasUserSelectedSidePanelListItemState.atom, true);
      }
    };

  useHotkeysOnFocusedElement({
    keys: Key.ArrowLeft,
    callback: handleArrowKey('ArrowLeft'),
    focusId: SIDE_PANEL_FOCUS_ID,
    dependencies: [collapsibleSections, setSectionOpen],
    options: { preventDefault: false },
  });

  useHotkeysOnFocusedElement({
    keys: Key.ArrowRight,
    callback: handleArrowKey('ArrowRight'),
    focusId: SIDE_PANEL_FOCUS_ID,
    dependencies: [collapsibleSections, setSectionOpen],
    options: { preventDefault: false },
  });
};
