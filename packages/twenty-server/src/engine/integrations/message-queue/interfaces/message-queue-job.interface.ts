export interface MessageQueueJob<T = any> {
  id: string;
  name: string;
  data: T;
}

export interface MessageQueueCronJobData<
  T extends MessageQueueJobData | undefined,
> {
  handle(data: T): Promise<void> | void;
}

export interface MessageQueueJobData {
  [key: string]: any;
}
