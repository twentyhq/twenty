export interface QueueJobOptions {
  id?: string;
  priority?: number;
  retryLimit?: number;
}

export interface QueueCronJobOptions extends QueueJobOptions {
  repeat?: {
    every?: number;
    pattern?: string;
    limit?: number;
  };
}
