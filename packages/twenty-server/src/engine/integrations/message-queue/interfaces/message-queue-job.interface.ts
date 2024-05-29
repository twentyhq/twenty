export interface MessageQueueJob<T extends MessageQueueJobData | undefined> {
  handle(data: T): Promise<void> | void;
}

export interface MessageQueueJobNew<T = any> {
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
