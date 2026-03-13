import { useIsHeadlessEngineCommandEffectInitialized } from '@/command-menu-item/engine-command/hooks/useIsHeadlessEngineCommandEffectInitialized';
import { type ReactNode, useContext, useEffect } from 'react';

import { COMMAND_MENU_CONFIRMATION_MODAL_RESULT_BROWSER_EVENT_NAME } from '@/command-menu-item/confirmation-modal/constants/CommandMenuItemConfirmationModalResultBrowserEventName';
import { useCommandMenuConfirmationModal } from '@/command-menu-item/confirmation-modal/hooks/useCommandMenuConfirmationModal';
import { type CommandMenuConfirmationModalResultBrowserEventDetail } from '@/command-menu-item/confirmation-modal/types/CommandMenuConfirmationModalResultBrowserEventDetail';
import { EngineCommandIdContext } from '@/command-menu-item/engine-command/contexts/EngineCommandIdContext';
import { useUnmountEngineCommand } from '@/command-menu-item/engine-command/hooks/useUnmountEngineCommand';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { isDefined } from 'twenty-shared/utils';
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
  const { isInitialized, setIsInitialized } =
    useIsHeadlessEngineCommandEffectInitialized();
  const engineCommandId = useContext(EngineCommandIdContext);
  const unmountEngineCommand = useUnmountEngineCommand();
  const { openConfirmationModal } = useCommandMenuConfirmationModal();
  const { enqueueErrorSnackBar } = useSnackBar();

  useEffect(() => {
    if (isInitialized || !isDefined(engineCommandId)) {
      return;
    }

    setIsInitialized(true);

    openConfirmationModal({
      frontComponentId: engineCommandId,
      title,
      subtitle,
      confirmButtonText,
      confirmButtonAccent,
    });
  }, [
    isInitialized,
    setIsInitialized,
    engineCommandId,
    openConfirmationModal,
    title,
    subtitle,
    confirmButtonText,
    confirmButtonAccent,
  ]);

  useEffect(() => {
    if (!isDefined(engineCommandId)) {
      return;
    }

    const handleConfirmationResult = async (event: Event) => {
      const customEvent =
        event as CustomEvent<CommandMenuConfirmationModalResultBrowserEventDetail>;

      if (customEvent.detail.frontComponentId !== engineCommandId) {
        return;
      }

      if (customEvent.detail.confirmationResult === 'confirm') {
        try {
          await execute();
        } catch (error) {
          if (error instanceof Error) {
            enqueueErrorSnackBar({ message: error.message });
          }
        }
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
  }, [engineCommandId, execute, unmountEngineCommand, enqueueErrorSnackBar]);

  return null;
};
