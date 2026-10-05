import { useEffect } from 'react';
import { COMMAND_MENU_CONFIRMATION_MODAL_RESULT_BROWSER_EVENT_NAME } from 'twenty-shared/constants';
import { type CommandMenuConfirmationModalResultBrowserEventDetail } from 'twenty-shared/types';

import { type FrontComponentThread } from '@/types/FrontComponentThread';

type FrontComponentConfirmationModalResultEffectProps = {
  thread: FrontComponentThread;
  frontComponentId: string;
  onError: (error: Error) => void;
};

export const FrontComponentConfirmationModalResultEffect = ({
  thread,
  frontComponentId,
  onError,
}: FrontComponentConfirmationModalResultEffectProps) => {
  useEffect(() => {
    const handleConfirmationModalResult = (
      event: CustomEvent<CommandMenuConfirmationModalResultBrowserEventDetail>,
    ) => {
      const { caller, confirmationResult } = event.detail;

      if (
        caller.type !== 'frontComponent' ||
        caller.frontComponentId !== frontComponentId
      ) {
        return;
      }

      thread.imports
        .onConfirmationModalResult(confirmationResult)
        .catch(onError);
    };

    window.addEventListener(
      COMMAND_MENU_CONFIRMATION_MODAL_RESULT_BROWSER_EVENT_NAME,
      handleConfirmationModalResult as EventListener,
    );

    return () => {
      window.removeEventListener(
        COMMAND_MENU_CONFIRMATION_MODAL_RESULT_BROWSER_EVENT_NAME,
        handleConfirmationModalResult as EventListener,
      );
    };
  }, [thread, frontComponentId, onError]);

  return null;
};
