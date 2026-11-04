import { buildAgentRunContinuationDeduplication } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-continuation-deduplication.util';

describe('buildAgentRunContinuationDeduplication', () => {
  it('keeps a resolved wake-up separate from a queued message that policy can reject', () => {
    const wakeUpId = 'wake-up-id';
    const messageDeduplication = buildAgentRunContinuationDeduplication({
      wakeUpId,
      outcomeType: 'MESSAGE_RECEIVED',
    });
    const resolvedWakeUpDeduplication = buildAgentRunContinuationDeduplication({
      wakeUpId,
      outcomeType: 'ANSWERED',
    });

    expect(messageDeduplication.id).not.toBe(resolvedWakeUpDeduplication.id);
    expect(messageDeduplication.keepLastIfActive).toBe(true);
    expect(resolvedWakeUpDeduplication.keepLastIfActive).toBeUndefined();
  });
});
