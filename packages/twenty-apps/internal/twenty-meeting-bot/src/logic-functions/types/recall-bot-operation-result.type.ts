export type RecallBotOperationFailure = {
  ok: false;
  // null = no HTTP response (network failure), distinct from any status code.
  status: number | null;
  errorMessage: string;
};

export type RecallBotScheduleResult =
  | {
      ok: true;
      externalBotId: string;
    }
  | RecallBotOperationFailure;

export type RecallBotRemovalResult =
  | {
      ok: true;
    }
  | RecallBotOperationFailure;
