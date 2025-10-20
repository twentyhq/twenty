export const QUEUE_RETENTION_COMPLETED = { age: 14400, count: 1000 } as const; // 4 hours (4*3600s) OR 1000 jobs
export const QUEUE_RETENTION_FAILED = { age: 604800, count: 1000 } as const; // 7 days (7*24*3600s) OR 1000 jobs

export const QUEUE_RETENTION_SECONDS = {
  completedMaxAge: QUEUE_RETENTION_COMPLETED.age,
  completedMaxCount: QUEUE_RETENTION_COMPLETED.count,
  failedMaxAge: QUEUE_RETENTION_FAILED.age,
  failedMaxCount: QUEUE_RETENTION_FAILED.count,
} as const;
