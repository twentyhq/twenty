export type DesktopRecordingSession = {
  source: 'desktop';
  media: 'audio';
  userWorkspaceId: string;
  platform: string;
  sdkUploadId?: string;
};
