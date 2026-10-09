import { CALL_RECORDING_MEDIA_STATE_NODE_SELECTION } from 'src/constants/call-recording-media-state-node-selection.constant';

export const CALL_RECORDING_SYNC_STATE_NODE_SELECTION = {
  ...CALL_RECORDING_MEDIA_STATE_NODE_SELECTION,
  deletedAt: true,
  status: true,
  title: true,
  recordingRequestStatus: true,
  startedAt: true,
  endedAt: true,
};
