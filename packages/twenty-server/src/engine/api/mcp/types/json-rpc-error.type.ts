export type JsonRpcError = {
  code: number;
  message: string;
  data?: Record<string, unknown>;
};
