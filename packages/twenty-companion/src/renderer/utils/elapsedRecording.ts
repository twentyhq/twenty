import { type ActiveRecording } from '../../shared/types/ActiveRecording';

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
