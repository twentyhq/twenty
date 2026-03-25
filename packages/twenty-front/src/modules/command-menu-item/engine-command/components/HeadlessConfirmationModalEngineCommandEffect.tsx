import { useIsHeadlessEngineCommandEffectInitialized } from '@/command-menu-item/engine-command/hooks/useIsHeadlessEngineCommandEffectInitialized';
import { type ReactNode, useEffect } from 'react';

import { COMMAND_MENU_CONFIRMATION_MODAL_RESULT_BROWSER_EVENT_NAME } from '@/command-menu-item/confirmation-modal/constants/CommandMenuItemConfirmationModalResultBrowserEventName';
import { useCommandMenuConfirmationModal } from '@/command-menu-item/confirmation-modal/hooks/useCommandMenuConfirmationModal';
import { type CommandMenuConfirmationModalResultBrowserEventDetail } from '@/command-menu-item/confirmation-modal/types/CommandMenuConfirmationModalResultBrowserEventDetail';
import { useUnmountCommand } from '@/command-menu-item/engine-command/hooks/useUnmountEngineCommand';
import { CommandComponentInstanceContext } from '@/command-menu-item/engine-command/states/contexts/CommandComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { type ButtonAccent } from 'twenty-ui/input';

export type HeadlessConfirmationModalEngineCommandEffectProps = {
  title: string;
  subtitle: ReactNode;
  confirmButtonText: string;
  confirmButtonAccent?: ButtonAccent;
  execute: () => void | Promise<unknown>;
};

export const HeadlessConfirmationModalEngineCommandEffect = ({
  title,
  subtitle,
  confirmButtonText,
  confirmButtonAccent = 'danger',
  execute,
}: HeadlessConfirmationModalEngineCommandEffectProps) => {
  const { isInitializedRef, setIsInitialized } =
    useIsHeadlessEngineCommandEffectInitialized();

  const commandMenuItemId = useAvailableComponentInstanceIdOrThrow(
    CommandComponentInstanceContext,
  );
  const unmountCommand = useUnmountCommand();
  const { openConfirmationModal } = useCommandMenuConfirmationModal();

  useEffect(() => {
    if (isInitializedRef.current) {
      return;
    }

    setIsInitialized(true);

    openConfirmationModal({
      caller: { type: 'commandMenuItem', commandMenuItemId },
      title,
      subtitle,
      confirmButtonText,
      confirmButtonAccent,
    });
  }, [
    isInitializedRef,
    setIsInitialized,
    commandMenuItemId,
    openConfirmationModal,
    title,
    subtitle,
    confirmButtonText,
    confirmButtonAccent,
  ]);

  useEffect(() => {
    const handleConfirmationResult = async (event: Event) => {
      const customEvent =
        event as CustomEvent<CommandMenuConfirmationModalResultBrowserEventDetail>;

      const caller = customEvent.detail.caller;

      if (
        caller.type !== 'commandMenuItem' ||
        caller.commandMenuItemId !== commandMenuItemId
      ) {
        return;
      }

      if (customEvent.detail.confirmationResult === 'confirm') {
        await execute();
      }

      unmountCommand(commandMenuItemId);
    };

    window.addEventListener(
      COMMAND_MENU_CONFIRMATION_MODAL_RESULT_BROWSER_EVENT_NAME,
      handleConfirmationResult,
    );

    return () => {
      window.removeEventListener(
        COMMAND_MENU_CONFIRMATION_MODAL_RESULT_BROWSER_EVENT_NAME,
        handleConfirmationResult,
      );
    };
  }, [execute, commandMenuItemId, unmountCommand]);

  return null;
};
