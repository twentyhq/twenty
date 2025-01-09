import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useKeyboardShortcutMenu } from '@/keyboard-shortcut-menu/hooks/useKeyboardShortcutMenu';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';

export const useCommandMenuHotKeys = () => {
  const { closeCommandMenu, toggleCommandMenu } = useCommandMenu();

  const commandMenuSearch = useRecoilValue(commandMenuSearchState);

  const setContextStoreTargetedRecordsRule = useSetRecoilComponentStateV2(
    contextStoreTargetedRecordsRuleComponentState,
    'command-menu',
  );

  const setContextStoreNumberOfSelectedRecords = useSetRecoilComponentStateV2(
    contextStoreNumberOfSelectedRecordsComponentState,
    'command-menu',
  );

  const { closeKeyboardShortcutMenu } = useKeyboardShortcutMenu();

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
      if (!isNonEmptyString(commandMenuSearch)) {
        setContextStoreTargetedRecordsRule({
          mode: 'selection',
          selectedRecordIds: [],
        });

        setContextStoreNumberOfSelectedRecords(0);
      }
    },
    AppHotkeyScope.CommandMenuOpen,
    [closeCommandMenu],
    {
      preventDefault: false,
    },
  );
};
