export const FATHOM_MEDIA_RECONCILIATION_SELECTION = {
  pageInfo: { hasNextPage: true },
  edges: {
    node: {
      id: true,
      externalRecordingId: true,
      video: { fileId: true },
      audio: { fileId: true },
      fathomMediaFailureReason: true,
      fathomConnectedAccountId: true,
      fathomMediaDownloadId: true,
      transcript: true,
      status: true,
      updatedAt: true,
      fathomMediaUploadCheckpoint: true,
    },
  },
};
