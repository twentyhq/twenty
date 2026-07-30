import { COMMAND_MENU_CONFIRMATION_MODAL_INSTANCE_ID } from '@/command-menu-item/confirmation-modal/constants/CommandMenuItemConfirmationModalId';
import { COMMAND_MENU_CONFIRMATION_MODAL_RESULT_BROWSER_EVENT_NAME } from 'twenty-shared/constants';
import { commandMenuItemConfirmationModalConfigState } from '@/command-menu-item/confirmation-modal/states/commandMenuItemConfirmationModalState';
import {
  type CommandMenuConfirmationModalResult,
  type CommandMenuConfirmationModalResultBrowserEventDetail,
} from 'twenty-shared/types';
import {
  ConfirmationModal,
  StyledCenteredButton,
} from '@/ui/layout/modal/components/ConfirmationModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { isDefined } from 'twenty-shared/utils';

export const CommandMenuConfirmationModalManager = () => {
  const commandMenuItemConfirmationModalConfig = useAtomStateValue(
    commandMenuItemConfirmationModalConfigState,
  );
  const isModalOpened = useAtomComponentStateValue(
    isModalOpenedComponentState,
    COMMAND_MENU_CONFIRMATION_MODAL_INSTANCE_ID,
  );
  const setCommandMenuItemConfirmationModalConfig = useSetAtomState(
    commandMenuItemConfirmationModalConfigState,
  );

  const caller = commandMenuItemConfirmationModalConfig?.caller;

  const emitConfirmationResult = (
    confirmationResult: CommandMenuConfirmationModalResult,
  ) => {
    if (!isDefined(caller)) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent<CommandMenuConfirmationModalResultBrowserEventDetail>(
        COMMAND_MENU_CONFIRMATION_MODAL_RESULT_BROWSER_EVENT_NAME,
        {
          detail: {
            caller,
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

  const linkButton = commandMenuItemConfirmationModalConfig.linkButton;

  return (
    <ConfirmationModal
      modalInstanceId={COMMAND_MENU_CONFIRMATION_MODAL_INSTANCE_ID}
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
      AdditionalButtons={
        isDefined(linkButton) ? (
          <StyledCenteredButton
            to={linkButton.to}
            onClick={() => emitConfirmationResult('cancel')}
            variant="secondary"
            title={linkButton.title}
            fullWidth
            justify="center"
          />
        ) : undefined
      }
    />
  );
};
