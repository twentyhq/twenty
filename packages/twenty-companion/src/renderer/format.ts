import { i18n } from '@lingui/core';
import { type ActiveRecording } from '../shared/types';

export const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
export const formatDate = (value: string) =>
  new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric' });
export const recordingLabel = (status: string) =>
  ({
    COMPLETED: i18n._('Saved to Twenty'),
    PROCESSING: i18n._('Processing'),
    FAILED: i18n._('Recording failed'),
    RECORDING: i18n._('Recording'),
    PENDING: i18n._('Preparing'),
  })[status] ?? i18n._('Preparing');
export const elapsedRecording = (recording: ActiveRecording, now: number) => {
  const end = recording.pausedAt ? Date.parse(recording.pausedAt) : now;
  const seconds = Math.max(
    0,
    Math.floor(
      (end -
        Date.parse(recording.startedAt) -
        (recording.pausedMilliseconds ?? 0)) /
        1000,
    ),
  );
  return (
    Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0') +
    ':' +
    (seconds % 60).toString().padStart(2, '0')
  );
};
