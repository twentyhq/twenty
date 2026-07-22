export const parseQueueListFromEnv = (value: string | undefined): string[] =>
  value
    ?.split(',')
    .map((queueName) => queueName.trim())
    .filter((queueName) => queueName.length > 0) ?? [];
