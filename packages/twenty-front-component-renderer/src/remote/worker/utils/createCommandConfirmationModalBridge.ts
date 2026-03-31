import {
  type CommandConfirmationModalResult,
  type OpenCommandConfirmationModalFunction,
} from 'twenty-sdk';
import { type FrontComponentHostCommunicationApi } from '../../../types/FrontComponentHostCommunicationApi';

type CommandConfirmationModalPromiseCallbacks = {
  resolve: (result: CommandConfirmationModalResult) => void;
  reject: (error: Error) => void;
};

let pendingCommandConfirmationModalPromiseCallbacks: CommandConfirmationModalPromiseCallbacks | null =
  null;

const clearPendingCommandConfirmationModalPromiseCallbacks = () => {
  pendingCommandConfirmationModalPromiseCallbacks = null;
};

export const createOpenCommandConfirmationModalAdapter = (
  hostApi: Pick<
    FrontComponentHostCommunicationApi,
    'openCommandConfirmationModal'
  >,
): OpenCommandConfirmationModalFunction => {
  return async (params) => {
    if (pendingCommandConfirmationModalPromiseCallbacks !== null) {
      throw new Error(
        'A confirmation modal is already pending for this front component',
      );
    }

    let rejectCommandConfirmationModalPromise: (
      error: Error,
    ) => void = () => {};

    const commandConfirmationModalResultPromise =
      new Promise<CommandConfirmationModalResult>((resolve, reject) => {
        rejectCommandConfirmationModalPromise = reject;
        pendingCommandConfirmationModalPromiseCallbacks = { resolve, reject };
      });

    try {
      await hostApi.openCommandConfirmationModal(params);
    } catch (error) {
      clearPendingCommandConfirmationModalPromiseCallbacks();

      rejectCommandConfirmationModalPromise(
        error instanceof Error ? error : new Error(String(error)),
      );
    }

    return commandConfirmationModalResultPromise;
  };
};

export const handleCommandConfirmationModalResult = async (
  result: CommandConfirmationModalResult,
) => {
  if (pendingCommandConfirmationModalPromiseCallbacks === null) {
    return;
  }

  const currentCommandConfirmationModalPromiseCallbacks =
    pendingCommandConfirmationModalPromiseCallbacks;
  clearPendingCommandConfirmationModalPromiseCallbacks();
  currentCommandConfirmationModalPromiseCallbacks.resolve(result);
};
