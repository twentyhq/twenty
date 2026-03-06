// oxlint-disable-next-line @typescripttypescript/no-explicit-any
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
  // oxlint-disable-next-line @typescripttypescript/no-explicit-any
  [key: string]: any;
}
