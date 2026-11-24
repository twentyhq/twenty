import { ROLLUP_FIELD_RECONCILE_SPREAD_MS } from 'src/engine/core-modules/rollup-field/constants/rollup-field-reconcile-spread-ms.constant';
import { computeRollupFieldReconcileDelayMs } from 'src/engine/core-modules/rollup-field/utils/compute-rollup-field-reconcile-delay-ms.util';

describe('computeRollupFieldReconcileDelayMs', () => {
  const workspaceIds = Array.from(
    { length: 50 },
    (_, index) =>
      `20202020-0000-4000-8000-${index.toString().padStart(12, '0')}`,
  );

  it('should return the same delay for a workspace every time', () => {
    expect(computeRollupFieldReconcileDelayMs(workspaceIds[0])).toBe(
      computeRollupFieldReconcileDelayMs(workspaceIds[0]),
    );
  });

  it('should stay within the spread window', () => {
    for (const workspaceId of workspaceIds) {
      const delayMs = computeRollupFieldReconcileDelayMs(workspaceId);

      expect(delayMs).toBeGreaterThanOrEqual(0);
      expect(delayMs).toBeLessThan(ROLLUP_FIELD_RECONCILE_SPREAD_MS);
    }
  });

  it('should spread workspaces across the window', () => {
    expect(
      new Set(workspaceIds.map(computeRollupFieldReconcileDelayMs)).size,
    ).toBeGreaterThan(40);
  });
});
