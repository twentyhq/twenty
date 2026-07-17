export interface QueueJobOptions {
  id?: string;
  // When false, allows several waiting jobs sharing the same id prefix
  // (id is then only used to make queue jobs traceable back to their source)
  deduplicate?: boolean;
  priority?: number;
  retryLimit?: number;
  delay?: number;
}

export interface QueueCronJobOptions extends QueueJobOptions {
  repeat: {
    every?: number;
    pattern?: string;
    limit?: number;
  };
}
