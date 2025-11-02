export type ToolOutput<T = object> = {
  success: boolean;
  message: string;
  error?: string;
  result?: T;
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
};
