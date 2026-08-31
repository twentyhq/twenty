import { describe, expect, it } from 'vitest';

import { isTerminalRecallBotSnapshot } from 'src/logic-functions/domain/is-terminal-recall-bot-snapshot.util';

const buildSnapshot = (
  statusChanges: Array<{ code: string; createdAt?: string }>,
) => ({
  id: 'recall-bot-1',
  metadata: {},
  statusChanges: statusChanges.map(({ code, createdAt }) => ({
    code,
    subCode: undefined,
    createdAt,
  })),
  recordings: [],
});

describe('isTerminalRecallBotSnapshot', () => {
  it('reports a finished bot as terminal', () => {
    expect(
      isTerminalRecallBotSnapshot(
        buildSnapshot([
          { code: 'joining_call', createdAt: '2026-01-01T10:00:00Z' },
          { code: 'done', createdAt: '2026-01-01T11:00:00Z' },
        ]),
      ),
    ).toBe(true);
  });

  it('reports a live bot as not terminal', () => {
    expect(
      isTerminalRecallBotSnapshot(
        buildSnapshot([
          { code: 'joining_call', createdAt: '2026-01-01T10:00:00Z' },
          { code: 'in_call_recording', createdAt: '2026-01-01T10:05:00Z' },
        ]),
      ),
    ).toBe(false);
  });

  it('picks the latest change by timestamp when the array is out of order', () => {
    expect(
      isTerminalRecallBotSnapshot(
        buildSnapshot([
          { code: 'done', createdAt: '2026-01-01T11:00:00Z' },
          { code: 'in_call_recording', createdAt: '2026-01-01T10:05:00Z' },
        ]),
      ),
    ).toBe(true);
  });

  it('is not terminal without any status change', () => {
    expect(isTerminalRecallBotSnapshot(buildSnapshot([]))).toBe(false);
  });
});
