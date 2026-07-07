import { definePostInstallLogicFunction } from 'twenty-sdk/define';

import { START_UPCOMING_CALENDAR_EVENTS_SWEEP_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/start-upcoming-calendar-events-sweep-logic-function-universal-identifier';
import { requestUpcomingCalendarEventsReconciliation } from 'src/logic-functions/data/request-upcoming-calendar-events-reconciliation.util';

type StartUpcomingCalendarEventsSweepResult = {
  sweepOutcome: 'sweep-requested';
};

export const startUpcomingCalendarEventsSweepHandler =
  async (): Promise<StartUpcomingCalendarEventsSweepResult> => {
    if (!(await requestUpcomingCalendarEventsReconciliation())) {
      throw new Error(
        '[call-recorder] Failed to start the upcoming calendar event sweep',
      );
    }

    return { sweepOutcome: 'sweep-requested' };
  };

export default definePostInstallLogicFunction({
  universalIdentifier:
    START_UPCOMING_CALENDAR_EVENTS_SWEEP_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'start-upcoming-calendar-events-sweep',
  description:
    'On a fresh install, sweeps upcoming calendar events so meetings created before installation get recording bots. Upgrades rely on the scheduled sweep instead.',
  timeoutSeconds: 30,
  shouldRunOnVersionUpgrade: false,
  handler: startUpcomingCalendarEventsSweepHandler,
});
