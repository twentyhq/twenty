import { GOOGLE_DRIVE_API_BASE_URL } from 'src/logic-functions/constants/google-drive-api.constant';
import { MeetException } from 'src/logic-functions/types/meet-exception.type';
import { buildGoogleApiUrlOrThrow } from 'src/logic-functions/utils/build-google-api-url-or-throw.util';
import { fetchMeetJson } from 'src/logic-functions/utils/fetch-meet-json.util';

export const getGoogleDriveFileSizeBytesOrThrow = async ({
  accessToken,
  driveFileId,
}: {
  accessToken: string;
  driveFileId: string;
}): Promise<number> => {
  const driveFile = await fetchMeetJson<{ size?: string }>({
    accessToken,
    url: buildGoogleApiUrlOrThrow({
      baseUrl: GOOGLE_DRIVE_API_BASE_URL,
      path: `files/${driveFileId}`,
      queryParameters: { fields: 'size' },
    }),
  });
  const sizeBytes = Number(driveFile.size);

  if (!Number.isSafeInteger(sizeBytes) || sizeBytes <= 0) {
    throw new MeetException({
      message: `Google Drive file ${driveFileId} has no readable size`,
      code: 'DRIVE_FILE_SIZE_UNREADABLE',
    });
  }

  return sizeBytes;
};
