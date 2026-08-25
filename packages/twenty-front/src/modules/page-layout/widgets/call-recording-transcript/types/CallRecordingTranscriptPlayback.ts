import { type CallRecordingTranscriptPlaybackPosition } from '@/page-layout/widgets/call-recording-transcript/types/CallRecordingTranscriptPlaybackPosition';

export type CallRecordingTranscriptPlayback = {
  position: CallRecordingTranscriptPlaybackPosition;
  videoElement: HTMLVideoElement;
  onSeek: (startSeconds: number) => void;
};
