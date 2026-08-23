import { beforeEach, describe, expect, it } from 'vitest';
import { computeEstimatedMinutes, decrementEstimate } from 'src/logic-functions/utils/estimate-migration-duration.util';
import { migrationState } from 'src/logic-functions/utils/migration-state.util';

describe('decrementEstimate', () => {
  beforeEach(() => {
    migrationState.maxRequests = 50;
    migrationState.estimate = null;
  });

  it('does nothing when stage1 has not set an estimate yet', () => {
    decrementEstimate({ batchableRecordCount: 100 });
    expect(migrationState.estimate).toBeNull();
  });

  it('subtracts the consumed amount from the matching bucket', () => {
    migrationState.estimate = { batchableRecordCount: 1000, otherRecordCount: 50, estimatedMinutes: 5 };

    decrementEstimate({ batchableRecordCount: 200 });

    expect(migrationState.estimate).toMatchObject({ batchableRecordCount: 800, otherRecordCount: 50 });
  });

  it('leaves the other bucket untouched when only one is consumed', () => {
    migrationState.estimate = { batchableRecordCount: 1000, otherRecordCount: 50, estimatedMinutes: 5 };

    decrementEstimate({ otherRecordCount: 10 });

    expect(migrationState.estimate).toMatchObject({ batchableRecordCount: 1000, otherRecordCount: 40 });
  });

  it('clamps at zero instead of going negative', () => {
    migrationState.estimate = { batchableRecordCount: 5, otherRecordCount: 0, estimatedMinutes: 1 };

    decrementEstimate({ batchableRecordCount: 100 });

    expect(migrationState.estimate?.batchableRecordCount).toBe(0);
  });

  it('recomputes estimatedMinutes to match the new remaining counts', () => {
    migrationState.estimate = { batchableRecordCount: 1000, otherRecordCount: 50, estimatedMinutes: 5 };

    decrementEstimate({ batchableRecordCount: 1000, otherRecordCount: 50 });

    expect(migrationState.estimate).toEqual({
      batchableRecordCount: 0,
      otherRecordCount: 0,
      estimatedMinutes: computeEstimatedMinutes(0, 0),
    });
    expect(migrationState.estimate?.estimatedMinutes).toBe(0);
  });
});
