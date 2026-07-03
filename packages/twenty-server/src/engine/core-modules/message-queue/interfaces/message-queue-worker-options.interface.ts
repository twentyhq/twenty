export interface MessageQueueWorkerOptions {
  concurrency?: number;
  lockDuration?: number;
  shutdownTimeoutMs?: number;
}
