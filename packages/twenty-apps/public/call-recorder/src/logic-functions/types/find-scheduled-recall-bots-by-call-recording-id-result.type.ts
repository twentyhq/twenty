import { type RecallScheduledBot } from 'src/logic-functions/recall-api/list-scheduled-recall-bots.util';

export type FindScheduledRecallBotsByCallRecordingIdResult =
  | { ok: true; recallBotsByCallRecordingId: Map<string, RecallScheduledBot[]> }
  | { ok: false };
