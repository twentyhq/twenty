import { type WidgetCallRecordingCandidate } from '@/page-layout/widgets/call-recording/types/WidgetCallRecordingCandidate';
import { isCallRecordingInProgress } from '@/page-layout/widgets/call-recording/utils/isCallRecordingInProgress';
import { isCallRecordingTranscriptFailed } from '@/page-layout/widgets/call-recording/utils/isCallRecordingTranscriptFailed';
import { isCallRecordingTranscriptStatusMarker } from 'twenty-shared/utils';

export const isCallRecordingTranscriptPending = (
  callRecording: WidgetCallRecordingCandidate,
): boolean =>
  !isCallRecordingTranscriptFailed(callRecording) &&
  (isCallRecordingInProgress(callRecording) ||
    isCallRecordingTranscriptStatusMarker(callRecording.transcript));
