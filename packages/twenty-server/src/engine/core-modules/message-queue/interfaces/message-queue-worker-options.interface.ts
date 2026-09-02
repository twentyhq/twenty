export interface MessageQueueWorkerOptions {
  concurrency?: number;
  lockDuration?: number;
  maxStalledCount?: number;
  boundedShutdownDrain?: boolean;
  limiter?: { max: number; durationMs: number };
}
