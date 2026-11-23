import { describe, expect, it } from 'vitest';

import { getGoogleMeetRecordingDriveFileId } from 'src/logic-functions/utils/get-google-meet-recording-drive-file-id.util';

describe('getGoogleMeetRecordingDriveFileId', () => {
  it('should return the Drive file of a generated recording', () => {
    expect(
      getGoogleMeetRecordingDriveFileId({
        state: 'FILE_GENERATED',
        driveDestination: { file: 'drive-file-id' },
      }),
    ).toBe('drive-file-id');
  });

  it('should return nothing while the recording file is not generated', () => {
    expect(
      getGoogleMeetRecordingDriveFileId({
        state: 'ENDED',
        driveDestination: { file: 'drive-file-id' },
      }),
    ).toBeUndefined();
    expect(
      getGoogleMeetRecordingDriveFileId({ state: 'FILE_GENERATED' }),
    ).toBeUndefined();
  });
});
