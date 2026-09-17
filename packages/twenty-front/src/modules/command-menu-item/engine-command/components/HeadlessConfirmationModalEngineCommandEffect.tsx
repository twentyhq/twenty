import { useIsHeadlessEngineCommandEffectInitialized } from '@/command-menu-item/engine-command/hooks/useIsHeadlessEngineCommandEffectInitialized';
import { type ReactNode, useEffect } from 'react';

import { COMMAND_MENU_CONFIRMATION_MODAL_RESULT_BROWSER_EVENT_NAME } from 'twenty-shared/constants';
import { useCommandMenuConfirmationModal } from '@/command-menu-item/confirmation-modal/hooks/useCommandMenuConfirmationModal';
import { type CommandMenuItemConfirmationModalLinkButton } from '@/command-menu-item/confirmation-modal/states/commandMenuItemConfirmationModalState';
import { type CommandMenuConfirmationModalResultBrowserEventDetail } from 'twenty-shared/types';
import { useUnmountCommand } from '@/command-menu-item/engine-command/hooks/useUnmountEngineCommand';
import { CommandComponentInstanceContext } from '@/command-menu-item/engine-command/states/contexts/CommandComponentInstanceContext';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useToast } from 'twenty-ui/primitives/feedback';
import { type ButtonColor } from 'twenty-ui/primitives/input';

export type HeadlessConfirmationModalEngineCommandEffectProps = {
  title: string;
  subtitle: ReactNode;
  confirmButtonText: string;
  confirmButtonColor?: ButtonColor;
  linkButton?: CommandMenuItemConfirmationModalLinkButton;
  execute: () => void | Promise<unknown>;
};

export const HeadlessConfirmationModalEngineCommandEffect = ({
  title,
  subtitle,
  confirmButtonText,
  confirmButtonColor = 'danger',
  linkButton,
  execute,
}: HeadlessConfirmationModalEngineCommandEffectProps) => {
  const { isInitializedRef, setIsInitialized } =
    useIsHeadlessEngineCommandEffectInitialized();

  const commandMenuItemId = useAvailableComponentInstanceIdOrThrow(
    CommandComponentInstanceContext,
  );
  const unmountCommand = useUnmountCommand();
  const { openConfirmationModal } = useCommandMenuConfirmationModal();
  const { enqueueToast } = useToast();

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
      confirmButtonColor,
      linkButton,
    });
  }, [
    isInitializedRef,
    setIsInitialized,
    commandMenuItemId,
    openConfirmationModal,
    title,
    subtitle,
    confirmButtonText,
    confirmButtonColor,
    linkButton,
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

      try {
        if (customEvent.detail.confirmationResult === 'confirm') {
          await execute();
        }
      } catch (error) {
        enqueueToast(getToastOptionsFromError({ error }));
      } finally {
        // Unmount even on failure, otherwise the headless command stays mounted
        // and can never be triggered again.
        unmountCommand(commandMenuItemId);
      }
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
  }, [execute, commandMenuItemId, unmountCommand, enqueueToast]);

  return null;
};
