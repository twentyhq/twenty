import { type CommandConfirmationModalResult } from 'twenty-sdk/front-component';
import { pendingCommandConfirmationModalPromiseCallbacksState } from '@/remote/worker/thread/states/pendingCommandConfirmationModalPromiseCallbacksState';

export const handleCommandConfirmationModalResult = async (
  result: CommandConfirmationModalResult,
) => {
  if (pendingCommandConfirmationModalPromiseCallbacksState.current === null) {
    return;
  }

  const currentCommandConfirmationModalPromiseCallbacks =
    pendingCommandConfirmationModalPromiseCallbacksState.current;
  pendingCommandConfirmationModalPromiseCallbacksState.current = null;
  currentCommandConfirmationModalPromiseCallbacks.resolve(result);
};
