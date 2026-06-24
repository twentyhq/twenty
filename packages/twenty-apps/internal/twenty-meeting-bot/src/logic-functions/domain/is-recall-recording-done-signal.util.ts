export const isRecallRecordingDoneSignal = ({
  event,
  statusCode,
}: {
  event: string;
  statusCode: string | undefined;
}): boolean =>
  event === 'recording.done' ||
  event === 'recording.failed' ||
  statusCode === 'done';
