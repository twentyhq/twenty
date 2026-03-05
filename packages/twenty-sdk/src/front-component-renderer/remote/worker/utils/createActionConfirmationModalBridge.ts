import {
  type ActionConfirmationModalResult,
  type OpenActionConfirmationModalFunction,
} from '@/sdk/front-component-api/globals/frontComponentHostCommunicationApi';
import { type FrontComponentHostCommunicationApi } from '../../../types/FrontComponentHostCommunicationApi';

type ActionConfirmationModalPromiseCallbacks = {
  resolve: (result: ActionConfirmationModalResult) => void;
  reject: (error: Error) => void;
};

let pendingActionConfirmationModalPromiseCallbacks: ActionConfirmationModalPromiseCallbacks | null =
  null;

const clearPendingActionConfirmationModalPromiseCallbacks = () => {
  pendingActionConfirmationModalPromiseCallbacks = null;
};

export const createOpenActionConfirmationModalAdapter = (
  hostApi: Pick<
    FrontComponentHostCommunicationApi,
    'openActionConfirmationModal'
  >,
): OpenActionConfirmationModalFunction => {
  return async (params) => {
    if (pendingActionConfirmationModalPromiseCallbacks !== null) {
      throw new Error(
        'A confirmation modal is already pending for this front component',
      );
    }

    let rejectActionConfirmationModalPromise: (error: Error) => void = () => {};

    const actionConfirmationModalResultPromise =
      new Promise<ActionConfirmationModalResult>((resolve, reject) => {
        rejectActionConfirmationModalPromise = reject;
        pendingActionConfirmationModalPromiseCallbacks = { resolve, reject };
      });

    try {
      await hostApi.openActionConfirmationModal(params);
    } catch (error) {
      clearPendingActionConfirmationModalPromiseCallbacks();

      rejectActionConfirmationModalPromise(
        error instanceof Error ? error : new Error(String(error)),
      );
    }

    return actionConfirmationModalResultPromise;
  };
};

export const handleActionConfirmationModalResult = async (
  result: ActionConfirmationModalResult,
) => {
  if (pendingActionConfirmationModalPromiseCallbacks === null) {
    return;
  }

  const currentActionConfirmationModalPromiseCallbacks =
    pendingActionConfirmationModalPromiseCallbacks;
  clearPendingActionConfirmationModalPromiseCallbacks();
  currentActionConfirmationModalPromiseCallbacks.resolve(result);
};
