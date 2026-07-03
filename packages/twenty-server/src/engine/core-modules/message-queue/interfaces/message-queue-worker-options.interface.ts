export interface MessageQueueWorkerOptions {
  concurrency?: number;
  lockDuration?: number;
  // How many times a job whose worker died may be re-run by the stalled
  // checker before failing; 0 fails it on the first stall
  maxStalledCount?: number;
  // How long a graceful shutdown waits for this queue's active jobs before
  // aborting them through their abort signal
  shutdownTimeoutMs?: number;
}
