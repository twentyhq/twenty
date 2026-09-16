import { type RecallBotOperationFailure } from 'src/logic-functions/types/RecallBotOperationFailure';

export type RecallBotRemovalResult =
  | {
      ok: true;
    }
  | RecallBotOperationFailure;
