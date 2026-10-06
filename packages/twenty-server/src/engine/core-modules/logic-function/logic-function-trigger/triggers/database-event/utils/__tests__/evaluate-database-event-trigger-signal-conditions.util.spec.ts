import {
  collectSignalNamesFromConditions,
  evaluateDatabaseEventTriggerSignalConditions,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/utils/evaluate-database-event-trigger-signal-conditions.util';

const importOngoing = { 'messaging.initialImport': { since: '2026-10-06' } };

describe('evaluateDatabaseEventTriggerSignalConditions', () => {
  it('matches without conditions', () => {
    expect(
      evaluateDatabaseEventTriggerSignalConditions({
        signalConditions: undefined,
        signalStates: importOngoing,
      }),
    ).toEqual({ matches: true });
  });

  it('matches when every signal has the expected state', () => {
    expect(
      evaluateDatabaseEventTriggerSignalConditions({
        signalConditions: {
          'messaging.initialImport': true,
          'calendar.import': false,
        },
        signalStates: importOngoing,
      }),
    ).toEqual({ matches: true });
  });

  it('names the first signal in the wrong state', () => {
    expect(
      evaluateDatabaseEventTriggerSignalConditions({
        signalConditions: {
          'calendar.import': false,
          'messaging.initialImport': false,
        },
        signalStates: importOngoing,
      }),
    ).toEqual({ matches: false, mismatchedSignal: 'messaging.initialImport' });
  });
});

describe('collectSignalNamesFromConditions', () => {
  it('lists each signal once, skipping functions without signal conditions', () => {
    expect(
      collectSignalNamesFromConditions([
        { 'messaging.import': false },
        undefined,
        { 'messaging.import': true, 'calendar.import': false },
      ]),
    ).toEqual(['messaging.import', 'calendar.import']);
  });
});
