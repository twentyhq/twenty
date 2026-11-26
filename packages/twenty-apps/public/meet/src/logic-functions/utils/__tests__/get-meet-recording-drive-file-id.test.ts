import { describe, expect, it } from 'vitest';

import { getMeetRecordingDriveFileId } from 'src/logic-functions/utils/get-meet-recording-drive-file-id.util';

describe('getMeetRecordingDriveFileId', () => {
  it('should return the Drive file of a generated recording', () => {
    expect(
      getMeetRecordingDriveFileId({
        state: 'FILE_GENERATED',
        driveDestination: { file: 'drive-file-id' },
      }),
    ).toBe('drive-file-id');
  });

  it('should return nothing while the recording file is not generated', () => {
    expect(
      getMeetRecordingDriveFileId({
        state: 'ENDED',
        driveDestination: { file: 'drive-file-id' },
      }),
    ).toBeUndefined();
    expect(
      getMeetRecordingDriveFileId({ state: 'FILE_GENERATED' }),
    ).toBeUndefined();
  });
});
