export type GraphErrorBody = {
  error?: {
    code?: unknown;
    message?: unknown;
    innerError?: { code?: unknown } | null;
  };
};
