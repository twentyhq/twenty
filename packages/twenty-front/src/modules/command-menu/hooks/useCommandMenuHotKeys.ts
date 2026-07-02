import { AI_CHAT_THREADS_LIST_FOCUS_ID } from '@/ai/constants/AiChatThreadsListFocusId';
import { useKeyboardShortcutMenu } from '@/keyboard-shortcut-menu/hooks/useKeyboardShortcutMenu';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { useOpenRecordsSearchPageInSidePanel } from '@/side-panel/hooks/useOpenRecordsSearchPageInSidePanel';
import { useSidePanelKeyboardNavigation } from '@/side-panel/hooks/useSidePanelKeyboardNavigation';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useGlobalHotkeys } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeys';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { Key } from 'ts-key-enum';

export const useCommandMenuHotKeys = () => {
  const { toggleSidePanelMenu } = useSidePanelMenu();

  const { openRecordsSearchPage } = useOpenRecordsSearchPageInSidePanel();

  const { openAskAiPage } = useOpenAskAiPageInSidePanel();

  const { handleSidePanelEscape } = useSidePanelKeyboardNavigation();

  const { closeKeyboardShortcutMenu } = useKeyboardShortcutMenu();

  useGlobalHotkeys({
    keys: ['ctrl+k', 'meta+k'],
    callback: () => {
      closeKeyboardShortcutMenu();
      toggleSidePanelMenu();
    },
    containsModifier: true,
    dependencies: [closeKeyboardShortcutMenu, toggleSidePanelMenu],
  });

  useGlobalHotkeys({
    keys: ['/'],
    callback: () => {
      openRecordsSearchPage();
    },
    containsModifier: false,
    dependencies: [openRecordsSearchPage],
    options: {
      ignoreModifiers: true,
    },
  });

  useGlobalHotkeys({
    keys: ['@'],
    callback: () => {
      openAskAiPage({ resetNavigationStack: true });
    },
    containsModifier: false,
    dependencies: [openAskAiPage],
    options: {
      ignoreModifiers: true,
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

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: () => {
      handleSidePanelEscape();
    },
    focusId: AI_CHAT_THREADS_LIST_FOCUS_ID,
    dependencies: [handleSidePanelEscape],
    options: {
      enableOnFormTags: false,
    },
  });
};
