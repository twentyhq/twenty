export interface MessageQueueWorkerOptions {
  concurrency?: number;
  lockDuration?: number;
  // How long a graceful shutdown waits for this queue's active jobs before
  // aborting them through their abort signal
  shutdownTimeoutMs?: number;
}
