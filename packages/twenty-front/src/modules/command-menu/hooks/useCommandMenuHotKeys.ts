import { COMMAND_MENU_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuComponentInstanceId';
import { SIDE_PANEL_FOCUS_ID } from '@/command-menu/constants/SidePanelFocusId';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useCommandMenuHistory } from '@/command-menu/hooks/useCommandMenuHistory';
import { useOpenAskAIPageInCommandMenu } from '@/command-menu/hooks/useOpenAskAIPageInCommandMenu';
import { useOpenRecordsSearchPageInCommandMenu } from '@/command-menu/hooks/useOpenRecordsSearchPageInCommandMenu';
import { useSetGlobalCommandMenuContext } from '@/command-menu/hooks/useSetGlobalCommandMenuContext';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useKeyboardShortcutMenu } from '@/keyboard-shortcut-menu/hooks/useKeyboardShortcutMenu';
import { useGlobalHotkeys } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeys';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';
import { FeatureFlagKey } from '~/generated/graphql';

export const useCommandMenuHotKeys = () => {
  const { toggleCommandMenu } = useCommandMenu();

  const { openRecordsSearchPage } = useOpenRecordsSearchPageInCommandMenu();

  const { openAskAIPage } = useOpenAskAIPageInCommandMenu();

  const { goBackFromCommandMenu } = useCommandMenuHistory();

  const { setGlobalCommandMenuContext } = useSetGlobalCommandMenuContext();

  const commandMenuSearch = useRecoilValue(commandMenuSearchState);

  const { closeKeyboardShortcutMenu } = useKeyboardShortcutMenu();

  const commandMenuPage = useRecoilValue(commandMenuPageState);

  const isAiEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);

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
    [closeKeyboardShortcutMenu, toggleCommandMenu],
  );

  useGlobalHotkeys(
    ['/'],
    () => {
      openRecordsSearchPage();
    },
    false,
    [openRecordsSearchPage],
    {
      ignoreModifiers: true,
    },
  );

  useGlobalHotkeys(
    ['@'],
    () => {
      if (isAiEnabled) {
        openAskAIPage();
      }
    },
    false,
    [openAskAIPage, isAiEnabled],
    {
      ignoreModifiers: true,
    },
  );

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: () => {
      goBackFromCommandMenu();
    },
    focusId: SIDE_PANEL_FOCUS_ID,
    dependencies: [goBackFromCommandMenu],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.Backspace, Key.Delete],
    callback: () => {
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
    focusId: SIDE_PANEL_FOCUS_ID,
    dependencies: [
      commandMenuPage,
      commandMenuSearch,
      contextStoreTargetedRecordsRuleComponent,
      goBackFromCommandMenu,
      setGlobalCommandMenuContext,
    ],
    options: {
      preventDefault: false,
    },
  });
};
