export type RecallWebhookEvent = {
  event: string;
  statusCode: string | undefined;
  statusSubCode: string | undefined;
  statusTimestamp: string | undefined;
  externalBotId: string | undefined;
  externalSdkUploadId?: string;
  externalRecordingId: string | undefined;
  callRecordingIdFromMetadata: string | undefined;
  recordingStartedAt: string | undefined;
  recordingEndedAt: string | undefined;
  transcriptId: string | undefined;
};
