import { type CommandConfirmationModalPromiseCallbacks } from '@/remote/worker/thread/types/CommandConfirmationModalPromiseCallbacks';

export const pendingCommandConfirmationModalPromiseCallbacks: {
  current: CommandConfirmationModalPromiseCallbacks | null;
} = { current: null };
