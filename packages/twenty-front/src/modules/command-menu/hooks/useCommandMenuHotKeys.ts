import { COMMAND_MENU_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuComponentInstanceId';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useCommandMenuHistory } from '@/command-menu/hooks/useCommandMenuHistory';
import { useOpenRecordsSearchPageInCommandMenu } from '@/command-menu/hooks/useOpenRecordsSearchPageInCommandMenu';
import { useSetGlobalCommandMenuContext } from '@/command-menu/hooks/useSetGlobalCommandMenuContext';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { CommandMenuHotkeyScope } from '@/command-menu/types/CommandMenuHotkeyScope';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useKeyboardShortcutMenu } from '@/keyboard-shortcut-menu/hooks/useKeyboardShortcutMenu';
import { useGlobalHotkeys } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeys';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';

export const useCommandMenuHotKeys = () => {
  const { toggleCommandMenu } = useCommandMenu();

  const { openRecordsSearchPage } = useOpenRecordsSearchPageInCommandMenu();

  const { goBackFromCommandMenu } = useCommandMenuHistory();

  const { setGlobalCommandMenuContext } = useSetGlobalCommandMenuContext();

  const commandMenuSearch = useRecoilValue(commandMenuSearchState);

  const { closeKeyboardShortcutMenu } = useKeyboardShortcutMenu();

  const commandMenuPage = useRecoilValue(commandMenuPageState);

  const contextStoreTargetedRecordsRuleComponent = useRecoilComponentValueV2(
    contextStoreTargetedRecordsRuleComponentState,
    COMMAND_MENU_COMPONENT_INSTANCE_ID,
  );

  useGlobalHotkeys(
    'ctrl+k,meta+k',
    () => {
      closeKeyboardShortcutMenu();
      toggleCommandMenu();
    },
    true,
    AppHotkeyScope.CommandMenu,
    [closeKeyboardShortcutMenu, toggleCommandMenu],
  );

  useGlobalHotkeys(
    ['/'],
    () => {
      openRecordsSearchPage();
    },
    false,
    AppHotkeyScope.SearchRecords,
    [openRecordsSearchPage],
    {
      ignoreModifiers: true,
    },
  );

  useGlobalHotkeys(
    [Key.Escape],
    () => {
      goBackFromCommandMenu();
    },
    true,
    CommandMenuHotkeyScope.CommandMenuFocused,
    [goBackFromCommandMenu],
  );

  useGlobalHotkeys(
    [Key.Backspace, Key.Delete],
    () => {
      if (isNonEmptyString(commandMenuSearch)) {
        return;
      }

      if (
        commandMenuPage === CommandMenuPages.Root &&
        !(
          contextStoreTargetedRecordsRuleComponent.mode === 'selection' &&
          contextStoreTargetedRecordsRuleComponent.selectedRecordIds.length ===
            0
        )
      ) {
        setGlobalCommandMenuContext();
      }
      if (commandMenuPage !== CommandMenuPages.Root) {
        goBackFromCommandMenu();
      }
    },
    true,
    CommandMenuHotkeyScope.CommandMenuFocused,
    [
      commandMenuPage,
      commandMenuSearch,
      contextStoreTargetedRecordsRuleComponent,
      goBackFromCommandMenu,
      setGlobalCommandMenuContext,
    ],
    {
      preventDefault: false,
    },
  );
};
