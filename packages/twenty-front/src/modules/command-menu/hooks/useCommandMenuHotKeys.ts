import { COMMAND_MENU_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuComponentInstanceId';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { useOpenAskAIPageInCommandMenu } from '@/command-menu/hooks/useOpenAskAIPageInCommandMenu';
import { useOpenRecordsSearchPageInCommandMenu } from '@/command-menu/hooks/useOpenRecordsSearchPageInCommandMenu';
import { useSetGlobalCommandMenuContext } from '@/command-menu/hooks/useSetGlobalCommandMenuContext';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useKeyboardShortcutMenu } from '@/keyboard-shortcut-menu/hooks/useKeyboardShortcutMenu';
import { useGlobalHotkeys } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeys';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { isNonEmptyString } from '@sniptt/guards';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { Key } from 'ts-key-enum';
import { SidePanelPages } from 'twenty-shared/types';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useCommandMenuHotKeys = () => {
  const { toggleCommandMenu } = useCommandMenu();

  const { openRecordsSearchPage } = useOpenRecordsSearchPageInCommandMenu();

  const { openAskAIPage } = useOpenAskAIPageInCommandMenu();

  const { goBackFromCommandMenu } = useSidePanelHistory();

  const { setGlobalCommandMenuContext } = useSetGlobalCommandMenuContext();

  const commandMenuSearch = useAtomStateValue(commandMenuSearchState);

  const { closeKeyboardShortcutMenu } = useKeyboardShortcutMenu();

  const sidePanelPage = useAtomStateValue(sidePanelPageState);

  const isAiEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);

  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
    COMMAND_MENU_COMPONENT_INSTANCE_ID,
  );

  useGlobalHotkeys({
    keys: ['ctrl+k', 'meta+k'],
    callback: () => {
      closeKeyboardShortcutMenu();
      toggleCommandMenu();
    },
    containsModifier: true,
    dependencies: [closeKeyboardShortcutMenu, toggleCommandMenu],
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
      goBackFromCommandMenu();
    },
    focusId: SIDE_PANEL_FOCUS_ID,
    dependencies: [goBackFromCommandMenu],
    options: {
      enableOnFormTags: false,
    },
  });

  useHotkeysOnFocusedElement({
    keys: [Key.Backspace, Key.Delete],
    callback: () => {
      if (isNonEmptyString(commandMenuSearch)) {
        return;
      }

      if (
        sidePanelPage === SidePanelPages.Root &&
        !(
          contextStoreTargetedRecordsRule.mode === 'selection' &&
          contextStoreTargetedRecordsRule.selectedRecordIds.length === 0
        )
      ) {
        setGlobalCommandMenuContext();
      }
      if (sidePanelPage !== SidePanelPages.Root) {
        goBackFromCommandMenu();
      }
    },
    focusId: SIDE_PANEL_FOCUS_ID,
    dependencies: [
      sidePanelPage,
      commandMenuSearch,
      contextStoreTargetedRecordsRule,
      goBackFromCommandMenu,
      setGlobalCommandMenuContext,
    ],
    options: {
      preventDefault: false,
      enableOnFormTags: false,
    },
  });
};
