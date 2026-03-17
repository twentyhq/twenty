import { useIsHeadlessEngineCommandEffectInitialized } from '@/command-menu-item/engine-command/hooks/useIsHeadlessEngineCommandEffectInitialized';
import { type ReactNode, useEffect } from 'react';

import { COMMAND_MENU_CONFIRMATION_MODAL_RESULT_BROWSER_EVENT_NAME } from '@/command-menu-item/confirmation-modal/constants/CommandMenuItemConfirmationModalResultBrowserEventName';
import { useCommandMenuConfirmationModal } from '@/command-menu-item/confirmation-modal/hooks/useCommandMenuConfirmationModal';
import { type CommandMenuConfirmationModalResultBrowserEventDetail } from '@/command-menu-item/confirmation-modal/types/CommandMenuConfirmationModalResultBrowserEventDetail';
import { useUnmountEngineCommand } from '@/command-menu-item/engine-command/hooks/useUnmountEngineCommand';
import { EngineCommandComponentInstanceContext } from '@/command-menu-item/engine-command/states/contexts/EngineCommandComponentInstanceContext';
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
  const engineCommandId = useAvailableComponentInstanceIdOrThrow(
    EngineCommandComponentInstanceContext,
  );
  const unmountEngineCommand = useUnmountEngineCommand();
  const { openConfirmationModal } = useCommandMenuConfirmationModal();

  useEffect(() => {
    if (isInitializedRef.current) {
      return;
    }

    setIsInitialized(true);

    openConfirmationModal({
      caller: { type: 'engineCommand', engineCommandId },
      title,
      subtitle,
      confirmButtonText,
      confirmButtonAccent,
    });
  }, [
    isInitializedRef,
    setIsInitialized,
    engineCommandId,
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
        caller.type !== 'engineCommand' ||
        caller.engineCommandId !== engineCommandId
      ) {
        return;
      }

      if (customEvent.detail.confirmationResult === 'confirm') {
        await execute();
      }

      unmountEngineCommand(engineCommandId);
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
  }, [engineCommandId, execute, unmountEngineCommand]);

  return null;
};
