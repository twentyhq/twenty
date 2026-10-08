export const isRecallRecordingDoneSignal = ({
  event,
  statusCode,
}: {
  event: string;
  statusCode: string | undefined;
}): boolean => {
  // Recall announces retention expiry as recording.deleted; the imports then settle from what Recall still answers.
  return (
    event === 'recording.done' ||
    event === 'recording.failed' ||
    event === 'recording.deleted' ||
    statusCode === 'done' ||
    statusCode === 'media_expired'
  );
};
