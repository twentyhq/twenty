import { useKeyboardShortcutMenu } from '@/keyboard-shortcut-menu/hooks/useKeyboardShortcutMenu';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useHandleSidePanelEscape } from '@/side-panel/hooks/useHandleSidePanelEscape';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { useOpenRecordsSearchPageInSidePanel } from '@/side-panel/hooks/useOpenRecordsSearchPageInSidePanel';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useGlobalHotkeys } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeys';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { Key } from 'ts-key-enum';

export const useCommandMenuHotKeys = () => {
  const { toggleSidePanelMenu } = useSidePanelMenu();

  const { openRecordsSearchPage } = useOpenRecordsSearchPageInSidePanel();

  const { openAskAiPage } = useOpenAskAiPageInSidePanel();

  const handleSidePanelEscape = useHandleSidePanelEscape();

  const { closeKeyboardShortcutMenu } = useKeyboardShortcutMenu();

  useGlobalHotkeys({
    keys: ['ctrl+k', 'meta+k'],
    callback: () => {
      closeKeyboardShortcutMenu();
      toggleSidePanelMenu();
    },
    containsModifier: true,
    enableOnSettingsPage: true,
    dependencies: [closeKeyboardShortcutMenu, toggleSidePanelMenu],
  });

  useGlobalHotkeys({
    keys: ['/'],
    callback: () => {
      openRecordsSearchPage();
    },
    containsModifier: false,
    enableOnSettingsPage: true,
    dependencies: [openRecordsSearchPage],
    options: {
      ignoreModifiers: true,
      enableOnFormTags: false,
      enableOnContentEditable: false,
    },
  });

  useGlobalHotkeys({
    keys: ['@'],
    callback: () => {
      openAskAiPage({ resetNavigationStack: true });
    },
    containsModifier: false,
    enableOnSettingsPage: true,
    dependencies: [openAskAiPage],
    options: {
      ignoreModifiers: true,
      enableOnFormTags: false,
      enableOnContentEditable: false,
    },
  });

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: () => {
      handleSidePanelEscape();
    },
    focusId: SIDE_PANEL_FOCUS_ID,
    dependencies: [handleSidePanelEscape],
    options: {
      enableOnFormTags: false,
    },
  });
};
