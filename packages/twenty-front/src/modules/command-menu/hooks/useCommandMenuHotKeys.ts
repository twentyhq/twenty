import { CommandMenuPages } from '@/command-menu/components/CommandMenuPages';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageTitle';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useKeyboardShortcutMenu } from '@/keyboard-shortcut-menu/hooks/useKeyboardShortcutMenu';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import { IconSearch } from 'twenty-ui';

export const useCommandMenuHotKeys = () => {
  const {
    closeCommandMenu,
    openCommandMenu,
    toggleCommandMenu,
    setGlobalCommandMenuContext,
  } = useCommandMenu();

  const commandMenuSearch = useRecoilValue(commandMenuSearchState);

  const { closeKeyboardShortcutMenu } = useKeyboardShortcutMenu();

  const commandMenuPage = useRecoilValue(commandMenuPageState);

  const contextStoreTargetedRecordsRuleComponent = useRecoilComponentValueV2(
    contextStoreTargetedRecordsRuleComponentState,
    'command-menu',
  );

  const setCommandMenuPageState = useSetRecoilState(commandMenuPageState);
  const setCommandMenuPageInfoState = useSetRecoilState(
    commandMenuPageInfoState,
  );

  useScopedHotkeys(
    'ctrl+k,meta+k',
    () => {
      closeKeyboardShortcutMenu();
      toggleCommandMenu();
    },
    AppHotkeyScope.CommandMenu,
    [toggleCommandMenu],
  );

  useScopedHotkeys(
    ['/'],
    () => {
      setCommandMenuPageState(CommandMenuPages.SearchRecords);
      setCommandMenuPageInfoState({
        title: 'Search',
        Icon: IconSearch,
      });
      openCommandMenu();
    },
    AppHotkeyScope.KeyboardShortcutMenu,
    [openCommandMenu],
    {
      ignoreModifiers: true,
    },
  );

  useScopedHotkeys(
    [Key.Escape],
    () => {
      closeCommandMenu();
    },
    AppHotkeyScope.CommandMenuOpen,
    [closeCommandMenu],
  );

  useScopedHotkeys(
    [Key.Backspace, Key.Delete],
    () => {
      if (
        commandMenuPage === CommandMenuPages.Root &&
        !isNonEmptyString(commandMenuSearch) &&
        !(
          contextStoreTargetedRecordsRuleComponent.mode === 'selection' &&
          contextStoreTargetedRecordsRuleComponent.selectedRecordIds.length ===
            0
        )
      ) {
        setGlobalCommandMenuContext();
      }
    },
    AppHotkeyScope.CommandMenuOpen,
    [closeCommandMenu],
    {
      preventDefault: false,
    },
  );
};
