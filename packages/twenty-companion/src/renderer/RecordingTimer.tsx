import { type ActiveRecording } from '../shared/types';
import { elapsedRecording } from './format';
import { useNow } from './useNow';

export const RecordingTimer = ({
  recording,
}: {
  recording: ActiveRecording;
}) => {
  const now = useNow(recording.pausedAt ? null : 1000);
  return <time>{elapsedRecording(recording, now)}</time>;
};
