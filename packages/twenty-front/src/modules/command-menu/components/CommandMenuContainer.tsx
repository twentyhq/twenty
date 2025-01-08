import { RecordActionMenuEntriesSetter } from '@/action-menu/actions/record-actions/components/RecordActionMenuEntriesSetter';
import { RecordAgnosticActionsSetterEffect } from '@/action-menu/actions/record-agnostic-actions/components/RecordAgnosticActionsSetterEffect';
import { ActionMenuConfirmationModals } from '@/action-menu/components/ActionMenuConfirmationModals';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { CommandMenu } from '@/command-menu/components/CommandMenu';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { useKeyboardShortcutMenu } from '@/keyboard-shortcut-menu/hooks/useKeyboardShortcutMenu';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useRecoilValue } from 'recoil';
import { FeatureFlagKey } from '~/generated/graphql';

export const CommandMenuContainer = () => {
  const { toggleCommandMenu } = useCommandMenu();
  const { closeKeyboardShortcutMenu } = useKeyboardShortcutMenu();

  const isWorkflowEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsWorkflowEnabled,
  );
  const isCommandMenuOpened = useRecoilValue(isCommandMenuOpenedState);

  useScopedHotkeys(
    'ctrl+k,meta+k',
    () => {
      closeKeyboardShortcutMenu();
      toggleCommandMenu();
    },
    AppHotkeyScope.CommandMenu,
    [toggleCommandMenu],
  );

  return (
    <ContextStoreComponentInstanceContext.Provider
      value={{ instanceId: 'command-menu' }}
    >
      <ActionMenuComponentInstanceContext.Provider
        value={{ instanceId: 'command-menu' }}
      >
        <ActionMenuContext.Provider
          value={{
            isInRightDrawer: false,
            onActionExecutedCallback: toggleCommandMenu,
          }}
        >
          <RecordActionMenuEntriesSetter />
          {isWorkflowEnabled && <RecordAgnosticActionsSetterEffect />}
          <ActionMenuConfirmationModals />
          {isCommandMenuOpened && <CommandMenu />}
        </ActionMenuContext.Provider>
      </ActionMenuComponentInstanceContext.Provider>
    </ContextStoreComponentInstanceContext.Provider>
  );
};
