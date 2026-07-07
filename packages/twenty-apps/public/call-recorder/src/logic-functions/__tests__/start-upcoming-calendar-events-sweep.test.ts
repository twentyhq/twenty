import { beforeEach, describe, expect, it, vi } from 'vitest';

import sweepLogicFunction, {
  startUpcomingCalendarEventsSweepHandler,
} from 'src/logic-functions/start-upcoming-calendar-events-sweep';

const requestUpcomingCalendarEventsReconciliationMock = vi.hoisted(() =>
  vi.fn(),
);

vi.mock(
  'src/logic-functions/data/request-upcoming-calendar-events-reconciliation.util',
  () => ({
    requestUpcomingCalendarEventsReconciliation:
      requestUpcomingCalendarEventsReconciliationMock,
  }),
);

describe('start-upcoming-calendar-events-sweep', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requestUpcomingCalendarEventsReconciliationMock.mockResolvedValue(true);
  });

  it('does not run on app version upgrades', () => {
    expect(sweepLogicFunction.config).toEqual(
      expect.objectContaining({
        name: 'start-upcoming-calendar-events-sweep',
        timeoutSeconds: 30,
        shouldRunOnVersionUpgrade: false,
      }),
    );
  });

  it('requests the upcoming calendar event sweep', async () => {
    const result = await startUpcomingCalendarEventsSweepHandler();

    expect(result).toEqual({ sweepOutcome: 'sweep-requested' });
    expect(
      requestUpcomingCalendarEventsReconciliationMock,
    ).toHaveBeenCalledTimes(1);
  });

  it('throws when the sweep kickoff fails', async () => {
    requestUpcomingCalendarEventsReconciliationMock.mockResolvedValue(false);

    await expect(startUpcomingCalendarEventsSweepHandler()).rejects.toThrow(
      'Failed to start the upcoming calendar event sweep',
    );
  });
});
