export interface MessageQueueWorkerOptions {
  concurrency?: number;
  globalConcurrency?: number;
  rateLimit?: { max: number; durationMs: number };
  lockDuration?: number;
  maxStalledCount?: number;
  boundedShutdownDrain?: boolean;
}
