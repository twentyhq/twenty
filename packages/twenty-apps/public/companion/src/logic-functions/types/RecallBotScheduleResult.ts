import { type RecallBotOperationFailure } from 'src/logic-functions/types/RecallBotOperationFailure';

export type RecallBotScheduleResult =
  | {
      ok: true;
      externalBotId: string;
    }
  | RecallBotOperationFailure;
