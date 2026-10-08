// WAITING: the owner takes the outcome, an event only once its record reads with the owner's permissions;
// NOT_READY: the owner arms its wake-up before it records that it waits, so the wake-up is held until it does;
// GONE: the owner stopped waiting, or no longer exists, and resolving only drops the wake-up
export type PendingWakeUpOwnerState<TOwner> =
  | { status: 'NOT_READY' }
  | { status: 'WAITING'; owner: TOwner }
  | { status: 'GONE'; owner: TOwner | null };
