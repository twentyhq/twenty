import { COMMAND_MENU_CONFIRMATION_MODAL_INSTANCE_ID } from '@/command-menu-item/confirmation-modal/constants/CommandMenuItemConfirmationModalId';
import { COMMAND_MENU_CONFIRMATION_MODAL_RESULT_BROWSER_EVENT_NAME } from '@/command-menu-item/confirmation-modal/constants/CommandMenuItemConfirmationModalResultBrowserEventName';
import { commandMenuItemConfirmationModalConfigState } from '@/command-menu-item/confirmation-modal/states/commandMenuItemConfirmationModalState';
import {
  type CommandMenuConfirmationModalResult,
  type CommandMenuConfirmationModalResultBrowserEventDetail,
} from '@/command-menu-item/confirmation-modal/types/CommandMenuConfirmationModalResultBrowserEventDetail';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useAICElement } from '@aicorg/sdk-react';
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

  const { attributes } = useAICElement({
    agentId: 'record.destroy.confirmation_modal',
    agentAction: 'confirm',
    agentConfirmation: {
      prompt_template:
        'Review the destructive action summary, then cancel unless explicit approval to confirm was given.',
      summary_fields: ['title', 'subtitle'],
      type: 'human_review',
    },
    agentDescription:
      'Confirmation dialog for destructive record commands. Cancel by default unless explicit approval to confirm is present.',
    agentLabel: 'Destructive action confirmation modal',
    agentRequiresConfirmation: true,
    agentRisk: 'critical',
    agentWorkflowStep: 'record.confirm_destructive_action',
  });

  if (!commandMenuItemConfirmationModalConfig || !isModalOpened) {
    return null;
  }

  return (
    <div {...attributes}>
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
      />
    </div>
  );
};
