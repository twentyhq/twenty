import { computeCronTriggerSpreadOffsetMs } from 'src/engine/core-modules/logic-function/logic-function-trigger/utils/compute-cron-trigger-spread-offset-ms.util';

const SPREAD_MS = 60 * 60_000;

const buildOffsets = ({
  workspaceCount,
  spreadMs = SPREAD_MS,
}: {
  workspaceCount: number;
  spreadMs?: number;
}) =>
  Array.from({ length: workspaceCount }, (_, index) =>
    computeCronTriggerSpreadOffsetMs({
      workspaceId: `workspace-${index}`,
      logicFunctionUniversalIdentifier: 'b6f9a5b4-1d4e-4a4b-9c55-6c1f0b2a7e11',
      spreadMs,
    }),
  );

describe('computeCronTriggerSpreadOffsetMs', () => {
  it('returns the same offset for the same workspace and function', () => {
    const input = {
      workspaceId: 'workspace-1',
      logicFunctionUniversalIdentifier: 'b6f9a5b4-1d4e-4a4b-9c55-6c1f0b2a7e11',
      spreadMs: SPREAD_MS,
    };

    expect(computeCronTriggerSpreadOffsetMs(input)).toBe(
      computeCronTriggerSpreadOffsetMs(input),
    );
  });

  it.each([2 * 60_000, 150_000, SPREAD_MS, 24 * 60 * 60_000])(
    'keeps whole-minute offsets in [0, %s)',
    (spreadMs) => {
      for (const offsetMs of buildOffsets({ workspaceCount: 200, spreadMs })) {
        expect(offsetMs % 60_000).toBe(0);
        expect(offsetMs).toBeGreaterThanOrEqual(0);
        expect(offsetMs).toBeLessThan(spreadMs);
      }
    },
  );

  it('spreads workspaces over the window', () => {
    expect(new Set(buildOffsets({ workspaceCount: 200 })).size).toBeGreaterThan(
      40,
    );
  });
});
