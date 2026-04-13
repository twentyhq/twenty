import { useKeyboardShortcutMenu } from '@/keyboard-shortcut-menu/hooks/useKeyboardShortcutMenu';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useOpenAskAIPageInSidePanel } from '@/side-panel/hooks/useOpenAskAIPageInSidePanel';
import { useOpenRecordsSearchPageInSidePanel } from '@/side-panel/hooks/useOpenRecordsSearchPageInSidePanel';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useGlobalHotkeys } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeys';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { isNonEmptyString } from '@sniptt/guards';
import { Key } from 'ts-key-enum';
import { SidePanelPages } from 'twenty-shared/types';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useCommandMenuHotKeys = () => {
  const { toggleSidePanelMenu } = useSidePanelMenu();

  const { openRecordsSearchPage } = useOpenRecordsSearchPageInSidePanel();

  const { openAskAIPage } = useOpenAskAIPageInSidePanel();

  const { goBackFromSidePanel, goBackOneSubPageOrMainPage } =
    useSidePanelHistory();

  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);

  const { closeKeyboardShortcutMenu } = useKeyboardShortcutMenu();

  const sidePanelPage = useAtomStateValue(sidePanelPageState);

  const isAiEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);

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
      if (isAiEnabled) {
        openAskAIPage({ resetNavigationStack: true });
      }
    },
    containsModifier: false,
    dependencies: [openAskAIPage, isAiEnabled],
    options: {
      ignoreModifiers: true,
    },
  });

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: () => {
      goBackFromSidePanel();
    },
    focusId: SIDE_PANEL_FOCUS_ID,
    dependencies: [goBackFromSidePanel],
    options: {
      enableOnFormTags: false,
    },
  });

  useHotkeysOnFocusedElement({
    keys: [Key.Backspace, Key.Delete],
    callback: () => {
      if (isNonEmptyString(sidePanelSearch)) {
        return;
      }

      if (sidePanelPage !== SidePanelPages.CommandMenuDisplay) {
        goBackOneSubPageOrMainPage();
      }
    },
    focusId: SIDE_PANEL_FOCUS_ID,
    dependencies: [sidePanelPage, sidePanelSearch, goBackOneSubPageOrMainPage],
    options: {
      preventDefault: false,
      enableOnFormTags: false,
    },
  });
};
