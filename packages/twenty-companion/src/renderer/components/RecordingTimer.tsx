import { type ActiveRecording } from '../../shared/types/ActiveRecording';
import { elapsedRecording } from '../utils/elapsedRecording';
import { useNow } from '../hooks/useNow';

export const RecordingTimer = ({
  recording,
}: {
  recording: ActiveRecording;
}) => {
  const now = useNow(recording.pausedAt ? null : 1000);
  return <time>{elapsedRecording(recording, now)}</time>;
};
