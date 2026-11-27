import { useKeyboardShortcutMenu } from '@/keyboard-shortcut-menu/hooks/useKeyboardShortcutMenu';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useHandleSidePanelEscape } from '@/side-panel/hooks/useHandleSidePanelEscape';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { useOpenRecordsSearchPageInSidePanel } from '@/side-panel/hooks/useOpenRecordsSearchPageInSidePanel';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useGlobalHotkeys } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeys';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { Key } from 'ts-key-enum';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useCommandMenuHotKeys = () => {
  const { toggleSidePanelMenu } = useSidePanelMenu();

  const { openRecordsSearchPage } = useOpenRecordsSearchPageInSidePanel();

  const { openAskAiPage } = useOpenAskAiPageInSidePanel();

  const handleSidePanelEscape = useHandleSidePanelEscape();

  const { closeKeyboardShortcutMenu } = useKeyboardShortcutMenu();

  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );

  const isSettingsPage = useIsSettingsPage();

  const searchAndAskAiHotkeysOptions = {
    ignoreModifiers: true,
    enableOnFormTags: !isSettingsPage,
    enableOnContentEditable: !isSettingsPage,
  };

  useGlobalHotkeys({
    keys: ['ctrl+k', 'meta+k'],
    callback: () => {
      closeKeyboardShortcutMenu();
      toggleSidePanelMenu();
    },
    containsModifier: true,
    enableOnSettingsPage: isCustomizableSidebarEnabled,
    dependencies: [
      closeKeyboardShortcutMenu,
      toggleSidePanelMenu,
      isCustomizableSidebarEnabled,
    ],
  });

  useGlobalHotkeys({
    keys: ['/'],
    callback: () => {
      openRecordsSearchPage();
    },
    containsModifier: false,
    enableOnSettingsPage: isCustomizableSidebarEnabled,
    dependencies: [openRecordsSearchPage, isCustomizableSidebarEnabled],
    options: searchAndAskAiHotkeysOptions,
  });

  useGlobalHotkeys({
    keys: ['@'],
    callback: () => {
      openAskAiPage({ resetNavigationStack: true });
    },
    containsModifier: false,
    enableOnSettingsPage: isCustomizableSidebarEnabled,
    dependencies: [openAskAiPage, isCustomizableSidebarEnabled],
    options: searchAndAskAiHotkeysOptions,
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
