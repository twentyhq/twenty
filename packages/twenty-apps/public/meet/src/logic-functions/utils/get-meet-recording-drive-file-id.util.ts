import { isNonEmptyString } from '@sniptt/guards';

import { type MeetRecording } from 'src/logic-functions/types/meet-recording.type';

export const getMeetRecordingDriveFileId = ({
  state,
  driveDestination,
}: Pick<MeetRecording, 'state' | 'driveDestination'>):
  | string
  | undefined => {
  const driveFileId = driveDestination?.file;

  return state === 'FILE_GENERATED' && isNonEmptyString(driveFileId)
    ? driveFileId
    : undefined;
};
