import { type ObjectRecord } from 'twenty-shared/types';

/**
 * Thrown inside a transactional dry-run to force an unconditional ROLLBACK
 * while preserving the simulated result for the caller.
 *
 * The outer `run()` catches this sentinel, extracts `simulatedResult`, and
 * returns it to the GraphQL layer — so no data is ever committed.
 */
export class DryRunRollbackSignal extends Error {
  readonly simulatedResult: ObjectRecord;

  constructor(simulatedResult: ObjectRecord) {
    super('dry-run-rollback-signal');
    this.name = 'DryRunRollbackSignal';
    this.simulatedResult = simulatedResult;
  }
}

