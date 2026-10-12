import { buildPendingWakeUpOutcome } from 'src/engine/core-modules/pending-wake-up/utils/build-pending-wake-up-outcome.util';

const EVENT = {
  eventName: 'company.updated',
  recordId: 'company-id',
  record: { id: 'company-id', name: 'Acme' },
};

describe('buildPendingWakeUpOutcome', () => {
  it('reports an event when one resolved the wake-up', () => {
    expect(
      buildPendingWakeUpOutcome({
        condition: { type: 'EVENT', eventName: 'company.updated' },
        event: EVENT,
      }),
    ).toEqual({ type: 'EVENT_RECEIVED', event: EVENT });
  });

  it('reports elapsed time for a time condition', () => {
    expect(
      buildPendingWakeUpOutcome({
        condition: { type: 'TIME', resumeAt: new Date().toISOString() },
      }),
    ).toEqual({ type: 'TIME_ELAPSED' });
  });

  it('reports an expiry for an event condition whose time came', () => {
    expect(
      buildPendingWakeUpOutcome({
        condition: { type: 'EVENT', eventName: 'company.updated' },
      }),
    ).toEqual({ type: 'EXPIRED' });
  });
});
