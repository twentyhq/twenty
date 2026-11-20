import { isNonEmptyString } from '@sniptt/guards';

import { type GoogleMeetRecording } from 'src/logic-functions/types/google-meet-recording.type';

export const getGoogleMeetRecordingDriveFileId = ({
  state,
  driveDestination,
}: Pick<GoogleMeetRecording, 'state' | 'driveDestination'>):
  | string
  | undefined => {
  const driveFileId = driveDestination?.file;

  return state === 'FILE_GENERATED' && isNonEmptyString(driveFileId)
    ? driveFileId
    : undefined;
};
