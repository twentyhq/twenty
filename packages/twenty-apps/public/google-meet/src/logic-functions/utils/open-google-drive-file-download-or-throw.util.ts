import { isDefined } from 'twenty-sdk/utils';

import { GOOGLE_DRIVE_API_BASE_URL } from 'src/logic-functions/constants/google-drive-api.constant';
import { GoogleMeetException } from 'src/logic-functions/types/google-meet-exception.type';
import { buildGoogleApiUrlOrThrow } from 'src/logic-functions/utils/build-google-api-url-or-throw.util';

export const openGoogleDriveFileDownloadOrThrow = async ({
  accessToken,
  driveFileId,
  signal,
}: {
  accessToken: string;
  driveFileId: string;
  signal: AbortSignal;
}): Promise<ReadableStream<Uint8Array>> => {
  const response = await fetch(
    buildGoogleApiUrlOrThrow({
      baseUrl: GOOGLE_DRIVE_API_BASE_URL,
      path: `files/${driveFileId}`,
      queryParameters: { alt: 'media' },
    }),
    { headers: { Authorization: `Bearer ${accessToken}` }, signal },
  );

  if (!response.ok || !isDefined(response.body)) {
    await response.body?.cancel();

    throw new GoogleMeetException({
      message: `Google Drive download of file ${driveFileId} failed (${response.status})`,
      code: 'REQUEST_FAILED',
      httpStatus: response.status,
    });
  }

  return response.body;
};
