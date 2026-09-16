export type RecallBotOperationFailure = {
  ok: false;
  // null = no HTTP response (network failure), distinct from any status code.
  status: number | null;
  errorMessage: string;
};
