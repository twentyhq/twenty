// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface MessageQueueJob<T = any> {
  id: string;
  name: string;
  data: T;
}

export interface MessageQueueJobData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
