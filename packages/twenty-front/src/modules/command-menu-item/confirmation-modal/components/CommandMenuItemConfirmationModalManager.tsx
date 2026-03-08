import { COMMAND_MENU_ITEM_CONFIRMATION_MODAL_RESULT_BROWSER_EVENT_NAME } from '@/command-menu-item/confirmation-modal/constants/CommandMenuItemConfirmationModalResultBrowserEventName';
import { COMMAND_MENU_ITEM_CONFIRMATION_MODAL_INSTANCE_ID } from '@/command-menu-item/confirmation-modal/constants/CommandMenuItemConfirmationModalId';
import { commandMenuItemConfirmationModalConfigState } from '@/command-menu-item/confirmation-modal/states/commandMenuItemConfirmationModalState';
import {
  type CommandMenuItemConfirmationModalResult,
  type CommandMenuItemConfirmationModalResultBrowserEventDetail,
} from '@/command-menu-item/confirmation-modal/types/CommandMenuItemConfirmationModalResultBrowserEventDetail';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const CommandMenuItemConfirmationModalManager = () => {
  const commandMenuItemConfirmationModalConfig = useAtomStateValue(
    commandMenuItemConfirmationModalConfigState,
  );
  const isModalOpened = useAtomComponentStateValue(
    isModalOpenedComponentState,
    COMMAND_MENU_ITEM_CONFIRMATION_MODAL_INSTANCE_ID,
  );
  const setCommandMenuItemConfirmationModalConfig = useSetAtomState(
    commandMenuItemConfirmationModalConfigState,
  );

  const callerId = commandMenuItemConfirmationModalConfig?.frontComponentId;

  const emitConfirmationResult = (
    confirmationResult: CommandMenuItemConfirmationModalResult,
  ) => {
    if (!callerId) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent<CommandMenuItemConfirmationModalResultBrowserEventDetail>(
        COMMAND_MENU_ITEM_CONFIRMATION_MODAL_RESULT_BROWSER_EVENT_NAME,
        {
          detail: {
            frontComponentId: callerId,
            confirmationResult,
          },
        },
      ),
    );

    setCommandMenuItemConfirmationModalConfig(null);
  };

  if (!commandMenuItemConfirmationModalConfig || !isModalOpened) {
    return null;
  }

  return (
    <ConfirmationModal
      modalInstanceId={COMMAND_MENU_ITEM_CONFIRMATION_MODAL_INSTANCE_ID}
      title={commandMenuItemConfirmationModalConfig.title}
      subtitle={commandMenuItemConfirmationModalConfig.subtitle}
      onConfirmClick={() => emitConfirmationResult('confirm')}
      onClose={() => emitConfirmationResult('cancel')}
      confirmButtonText={
        commandMenuItemConfirmationModalConfig.confirmButtonText
      }
      confirmButtonAccent={
        commandMenuItemConfirmationModalConfig.confirmButtonAccent
      }
    />
  );
};
