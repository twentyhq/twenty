import { type MediaRecordingMediaType } from 'twenty-front-component-renderer';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// The one live recording, host-wide: it drives the recording indicator and
// busy-gates concurrent starts. requestCancel is the indicator's stop button —
// host-initiated stops discard the recording rather than uploading it.
export type FrontComponentMediaRecording = {
  recordingId: string;
  applicationId: string;
  mediaType: MediaRecordingMediaType;
  startedAt: number;
  requestCancel: () => void;
  getLiveMediaStream: () => MediaStream | null;
};

export const frontComponentMediaRecordingState =
  createAtomState<FrontComponentMediaRecording | null>({
    key: 'frontComponentMediaRecordingState',
    defaultValue: null,
  });
