export interface MessageQueueWorkerOptions {
  concurrency?: number;
  globalConcurrency?: number | null;
  lockDuration?: number;
  maxStalledCount?: number;
  boundedShutdownDrain?: boolean;
}
