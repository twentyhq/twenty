export const getQueueToken = (queueName: string) =>
  `MESSAGE_QUEUE_${queueName}`;
