import { computeRollupRecordUpdates } from 'src/engine/core-modules/rollup-field/utils/compute-rollup-record-updates.util';

describe('computeRollupRecordUpdates', () => {
  it('should only write the values that changed', () => {
    expect(
      computeRollupRecordUpdates({
        storedValuesByRecordId: {
          'record-1': { taskCount: 2, totalEstimate: 10 },
        },
        computedValuesByRecordId: {
          'record-1': { taskCount: 3, totalEstimate: 10 },
        },
      }),
    ).toEqual([{ criteria: 'record-1', partialEntity: { taskCount: 3 } }]);
  });

  it('should skip a record whose values are already up to date', () => {
    expect(
      computeRollupRecordUpdates({
        storedValuesByRecordId: {
          'record-1': { taskCount: 0, lastDueAt: null },
        },
        computedValuesByRecordId: {
          'record-1': { taskCount: 0, lastDueAt: null },
        },
      }),
    ).toEqual([]);
  });

  it('should write a value that was never computed', () => {
    expect(
      computeRollupRecordUpdates({
        storedValuesByRecordId: { 'record-1': { taskCount: null } },
        computedValuesByRecordId: { 'record-1': { taskCount: 0 } },
      }),
    ).toEqual([{ criteria: 'record-1', partialEntity: { taskCount: 0 } }]);
  });

  it('should empty a value that no longer has related records', () => {
    expect(
      computeRollupRecordUpdates({
        storedValuesByRecordId: {
          'record-1': { lastDueAt: '2026-06-15T09:00:00.000Z' },
        },
        computedValuesByRecordId: { 'record-1': { lastDueAt: null } },
      }),
    ).toEqual([{ criteria: 'record-1', partialEntity: { lastDueAt: null } }]);
  });

  it('should ignore a record that was not computed', () => {
    expect(
      computeRollupRecordUpdates({
        storedValuesByRecordId: { 'record-1': { taskCount: 2 } },
        computedValuesByRecordId: {},
      }),
    ).toEqual([]);
  });
});
