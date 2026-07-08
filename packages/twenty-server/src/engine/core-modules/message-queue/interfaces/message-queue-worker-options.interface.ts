export interface MessageQueueWorkerOptions {
  concurrency?: number;
  lockDuration?: number;
  maxStalledCount?: number;
}
