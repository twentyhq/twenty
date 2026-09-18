import { getUpcomingMeetings } from '../../shared/utils/getUpcomingMeetings';
import { type CompanionState } from '../../shared/types/CompanionState';

export const getTrayTitle = (
  state: CompanionState,
  now = Date.now(),
): string => {
  if (state.activeRecording)
    return state.activeRecording.status === 'paused' ? 'Paused' : '●';
  if (!state.settings.showMeetingCountdown) return '';
  const next = getUpcomingMeetings({ meetings: state.meetings, now: now })[0];
  if (!next) return '';
  const minutes = Math.max(
    0,
    Math.ceil((Date.parse(next.startsAt) - now) / 60_000),
  );
  if (minutes <= 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};
