import { v5 } from 'uuid';

const AGENT_RUN_CONTINUATION_TURN_ID_NAMESPACE =
  'bb18356e-0e37-478f-b89c-f323cba2f6dd';

export const buildAgentRunContinuationTurnId = (wakeUpId: string): string =>
  v5(wakeUpId, AGENT_RUN_CONTINUATION_TURN_ID_NAMESPACE);
