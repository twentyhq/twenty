import { type CommandConfirmationModalPromiseCallbacks } from '@/remote/worker/thread/types/CommandConfirmationModalPromiseCallbacks';

export const pendingCommandConfirmationModalPromiseCallbacksState: {
  current: CommandConfirmationModalPromiseCallbacks | null;
} = { current: null };
