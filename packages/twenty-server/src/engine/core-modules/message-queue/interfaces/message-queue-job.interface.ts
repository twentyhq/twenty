// oxlint-disable-next-line typescript/no-explicit-any
export interface MessageQueueJob<T = any> {
  id: string;
  name: string;
  data: T;
  retryLimit: number;
  updateData(data: T): Promise<void>;
  abortSignal?: AbortSignal;
}

export interface MessageQueueJobContext {
  abortSignal?: AbortSignal;
}

export interface MessageQueueJobRetryContext<
  T = MessageQueueJobData,
> extends MessageQueueJobContext {
  retryLimit: number;
  updateData(data: T): Promise<void>;
}

export interface MessageQueueCronJobData<
  T extends MessageQueueJobData | undefined,
> {
  handle(data: T): Promise<void> | void;
}

export interface MessageQueueJobData {
  // oxlint-disable-next-line typescript/no-explicit-any
  [key: string]: any;
}
