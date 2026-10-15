import { type ObjectRecordEvent } from 'twenty-shared/database-events';

import { doesEventMatchPendingWakeUp } from 'src/engine/core-modules/pending-wake-up/utils/does-event-match-pending-wake-up.util';

const buildUpdateEvent = ({
  recordId,
  updatedFields,
}: {
  recordId: string;
  updatedFields: string[];
}) =>
  ({
    recordId,
    properties: { before: {}, after: {}, updatedFields, diff: {} },
  }) as unknown as ObjectRecordEvent;

describe('doesEventMatchPendingWakeUp', () => {
  it('matches any record when the condition names none', () => {
    expect(
      doesEventMatchPendingWakeUp({
        condition: { type: 'EVENT', eventName: 'company.updated' },
        event: buildUpdateEvent({ recordId: 'a', updatedFields: ['name'] }),
      }),
    ).toBe(true);
  });

  it('only matches the record the condition names', () => {
    const condition = {
      type: 'EVENT' as const,
      eventName: 'company.updated',
      recordId: 'a',
    };

    expect(
      doesEventMatchPendingWakeUp({
        condition,
        event: buildUpdateEvent({ recordId: 'a', updatedFields: ['name'] }),
      }),
    ).toBe(true);
    expect(
      doesEventMatchPendingWakeUp({
        condition,
        event: buildUpdateEvent({ recordId: 'b', updatedFields: ['name'] }),
      }),
    ).toBe(false);
  });

  it('only matches updates that changed one of the watched fields', () => {
    const condition = {
      type: 'EVENT' as const,
      eventName: 'company.updated',
      updatedFields: ['stage'],
    };

    expect(
      doesEventMatchPendingWakeUp({
        condition,
        event: buildUpdateEvent({ recordId: 'a', updatedFields: ['stage'] }),
      }),
    ).toBe(true);
    expect(
      doesEventMatchPendingWakeUp({
        condition,
        event: buildUpdateEvent({ recordId: 'a', updatedFields: ['name'] }),
      }),
    ).toBe(false);
  });

  it('does not match a field-filtered condition on an event that reports no changed fields', () => {
    expect(
      doesEventMatchPendingWakeUp({
        condition: {
          type: 'EVENT',
          eventName: 'company.updated',
          updatedFields: ['stage'],
        },
        event: buildUpdateEvent({ recordId: 'a', updatedFields: [] }),
      }),
    ).toBe(false);
  });

  it('never matches a condition that is not on an event', () => {
    expect(
      doesEventMatchPendingWakeUp({
        condition: { type: 'TIME', resumeAt: new Date().toISOString() },
        event: buildUpdateEvent({ recordId: 'a', updatedFields: [] }),
      }),
    ).toBe(false);
  });
});
