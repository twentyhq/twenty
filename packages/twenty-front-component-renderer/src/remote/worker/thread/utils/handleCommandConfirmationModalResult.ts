import { type CommandConfirmationModalResult } from 'twenty-sdk/front-component';
import { pendingCommandConfirmationModalPromiseCallbacks } from '@/remote/worker/thread/states/pendingCommandConfirmationModalPromiseCallbacks';

export const handleCommandConfirmationModalResult = async (
  result: CommandConfirmationModalResult,
) => {
  if (pendingCommandConfirmationModalPromiseCallbacks.current === null) {
    return;
  }

  const currentCommandConfirmationModalPromiseCallbacks =
    pendingCommandConfirmationModalPromiseCallbacks.current;
  pendingCommandConfirmationModalPromiseCallbacks.current = null;
  currentCommandConfirmationModalPromiseCallbacks.resolve(result);
};
