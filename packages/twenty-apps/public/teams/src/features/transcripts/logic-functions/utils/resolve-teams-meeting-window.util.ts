import { isNonEmptyString } from '@sniptt/guards';

import {
  MILLISECONDS_PER_DAY,
  TEAMS_DEFAULT_LOOKBACK_DAYS,
} from 'src/features/transcripts/constants/teams.constant';
import { type TeamsMeetingWindow } from 'src/features/transcripts/logic-functions/types/teams-meeting-window.type';

export const resolveTeamsMeetingWindow = ({
  startDateTime,
  endDateTime,
}: {
  startDateTime?: unknown;
  endDateTime?: unknown;
}): TeamsMeetingWindow => {
  const now = Date.now();
  const window = {
    startDateTime: isNonEmptyString(startDateTime)
      ? startDateTime
      : new Date(
          now - TEAMS_DEFAULT_LOOKBACK_DAYS * MILLISECONDS_PER_DAY,
        ).toISOString(),
    endDateTime: isNonEmptyString(endDateTime)
      ? endDateTime
      : new Date(now).toISOString(),
  };
  const startMilliseconds = Date.parse(window.startDateTime);
  const endMilliseconds = Date.parse(window.endDateTime);

  if (
    !Number.isFinite(startMilliseconds) ||
    !Number.isFinite(endMilliseconds) ||
    startMilliseconds >= endMilliseconds
  ) {
    throw new Error('Provide a valid startDateTime before endDateTime');
  }

  return window;
};
