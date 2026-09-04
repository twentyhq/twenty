export type FathomRequestMediaDownloadPayload = {
  connectedAccountId: string;
  recordingId: number;
  callRecordingId: string;
};

export type FathomImportMediaDownloadPayload =
  FathomRequestMediaDownloadPayload & {
    downloadId: string;
    attempt: number;
  };
