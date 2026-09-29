import { describe, expect, it } from 'vitest';

import { hasRecallBotEnded } from 'src/logic-functions/recall-api/has-recall-bot-ended.util';
import { type RecallBotStatusChange } from 'src/logic-functions/recall-api/recall-bot-snapshot.type';

const buildRecallBot = (statusCodes: string[]) => ({
  id: 'recall-bot-1',
  metadata: {},
  statusChanges: statusCodes.map(
    (code): RecallBotStatusChange => ({ code, createdAt: undefined }),
  ),
  recordings: [],
});

describe('hasRecallBotEnded', () => {
  it('treats a bot that is only scheduled as not ended', () => {
    expect(hasRecallBotEnded(buildRecallBot([]))).toBe(false);
  });

  it('treats a bot that is joining or in the call as not ended', () => {
    expect(
      hasRecallBotEnded(
        buildRecallBot(['ready', 'joining_call', 'in_call_recording']),
      ),
    ).toBe(false);
  });

  it('treats a bot that left the call or failed as ended', () => {
    expect(
      hasRecallBotEnded(
        buildRecallBot(['joining_call', 'in_call_recording', 'call_ended']),
      ),
    ).toBe(true);
    expect(hasRecallBotEnded(buildRecallBot(['joining_call', 'fatal']))).toBe(
      true,
    );
  });
});
