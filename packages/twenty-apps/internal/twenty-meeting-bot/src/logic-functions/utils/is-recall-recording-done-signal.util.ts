// 'call_ended' is deliberately excluded: artifacts are not downloadable
// until Recall reports the recording itself done.
export const isRecallRecordingDoneSignal = ({
  event,
  statusCode,
}: {
  event: string;
  statusCode: string | undefined;
}): boolean => event === 'recording.done' || statusCode === 'done';
