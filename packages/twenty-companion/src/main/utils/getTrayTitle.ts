import { getUpcomingMeetings } from '../../shared/utils/getUpcomingMeetings';
import { type CompanionState } from '../../shared/types/CompanionState';
import { i18n } from '../../shared/i18n';

export const getTrayTitle = (
  state: CompanionState,
  now = Date.now(),
): string => {
  if (state.activeRecording)
    return state.activeRecording.status === 'paused' ? i18n._('Paused') : '●';
  if (!state.settings.showMeetingCountdown) return '';
  const next = getUpcomingMeetings({ meetings: state.meetings, now: now })[0];
  if (!next) return '';
  const minutes = Math.max(
    0,
    Math.ceil((Date.parse(next.startsAt) - now) / 60_000),
  );
  if (minutes <= 60) return i18n._('{minutes}m', { minutes });
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes
    ? i18n._('{hours}h {remainingMinutes}m', { hours, remainingMinutes })
    : i18n._('{hours}h', { hours });
};
