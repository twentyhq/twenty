import {
  type CommandConfirmationModalResult,
  type OpenCommandConfirmationModalFunction,
} from 'twenty-sdk/front-component';
import { CustomError } from 'twenty-shared/utils';
import { pendingCommandConfirmationModalPromiseCallbacksState } from '@/remote/worker/thread/states/pendingCommandConfirmationModalPromiseCallbacksState';
import { type FrontComponentHostCommunicationApi } from '@/types/FrontComponentHostCommunicationApi';

export const createOpenCommandConfirmationModalAdapter = (
  hostApi: Pick<
    FrontComponentHostCommunicationApi,
    'openCommandConfirmationModal'
  >,
): OpenCommandConfirmationModalFunction => {
  return async (params) => {
    if (pendingCommandConfirmationModalPromiseCallbacksState.current !== null) {
      throw new CustomError(
        'A confirmation modal is already pending for this front component',
        'FRONT_COMPONENT_CONFIRMATION_MODAL_ALREADY_PENDING',
      );
    }

    let rejectCommandConfirmationModalPromise: (
      error: Error,
    ) => void = () => {};

    const commandConfirmationModalResultPromise =
      new Promise<CommandConfirmationModalResult>((resolve, reject) => {
        rejectCommandConfirmationModalPromise = reject;
        pendingCommandConfirmationModalPromiseCallbacksState.current = {
          resolve,
          reject,
        };
      });

    try {
      await hostApi.openCommandConfirmationModal(params);
    } catch (error) {
      pendingCommandConfirmationModalPromiseCallbacksState.current = null;

      rejectCommandConfirmationModalPromise(
        error instanceof Error ? error : new Error(String(error)),
      );
    }

    return commandConfirmationModalResultPromise;
  };
};
