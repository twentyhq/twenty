import { type CallRecordingTranscriptPlaybackPosition } from '@/page-layout/widgets/call-recording-transcript/types/CallRecordingTranscriptPlaybackPosition';

export type CallRecordingTranscriptPlayback = {
  position: CallRecordingTranscriptPlaybackPosition;
  mediaElement: HTMLMediaElement;
  onSeek: (startSeconds: number) => void;
};
