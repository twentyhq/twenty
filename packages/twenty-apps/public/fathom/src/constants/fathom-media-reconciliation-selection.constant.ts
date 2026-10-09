import { CALL_RECORDING_MEDIA_STATE_NODE_SELECTION } from 'src/constants/call-recording-media-state-node-selection.constant';

export const FATHOM_MEDIA_RECONCILIATION_SELECTION = {
  pageInfo: { hasNextPage: true },
  edges: {
    node: {
      ...CALL_RECORDING_MEDIA_STATE_NODE_SELECTION,
      status: true,
    },
  },
};
