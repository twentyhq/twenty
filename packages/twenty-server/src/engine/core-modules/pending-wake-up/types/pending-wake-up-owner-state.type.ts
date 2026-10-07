// Whether the owner of a wake-up, or the caller of an agent run, still waits on it.
// WAITING: the owner takes the outcome now, an event only once its record reads with the owner's permissions;
// NOT_READY: the owner arms its wait before it records that it waits, so the outcome is held until it does;
// GONE: the owner stopped waiting, such as a workflow run that ended, or no longer exists
export type OwnerWaitingState = 'WAITING' | 'NOT_READY' | 'GONE';

export type PendingWakeUpOwnerState<TOwner> =
  | { status: 'NOT_READY' }
  | { status: 'WAITING'; owner: TOwner }
  | { status: 'GONE'; owner: TOwner | null };
