export type RecallBotOperationFailure = {
  ok: false;
  status: number | null;
  errorMessage: string;
};

export type RecallBotOperationResult =
  | {
      ok: true;
      externalBotId: string | null;
    }
  | RecallBotOperationFailure;
