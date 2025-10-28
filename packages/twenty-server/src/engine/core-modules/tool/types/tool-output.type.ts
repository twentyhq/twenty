export type ToolOutput<T = object> = {
  success: boolean;
  message: string;
  error?: string;
  result?: T;
};
