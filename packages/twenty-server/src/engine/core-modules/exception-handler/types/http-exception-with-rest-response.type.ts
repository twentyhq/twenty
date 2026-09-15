export type HttpExceptionWithRestResponse = {
  getResponseHeaders: () => Record<string, string>;
  getResponseBody: () => Record<string, unknown>;
};
