export interface MessageQueueWorkerOptions {
  concurrency?: number;
  globalConcurrency?: number;
  lockDuration?: number;
  maxStalledCount?: number;
  boundedShutdownDrain?: boolean;
}
