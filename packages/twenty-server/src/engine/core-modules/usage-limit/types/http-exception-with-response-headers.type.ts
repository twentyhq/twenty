export type HttpExceptionWithResponseHeaders = {
  getResponseHeaders: () => Record<string, string>;
};
