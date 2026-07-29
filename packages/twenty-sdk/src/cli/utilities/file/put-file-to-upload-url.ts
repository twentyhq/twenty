import axios from 'axios';
import * as fs from 'fs';

// Deliberately not the authenticated ApiClient: the upload url is either a
// presigned storage url, whose signature an extra Authorization header would
// invalidate, or a server endpoint authenticated by the token it carries.
export const putFileToUploadUrl = async ({
  absolutePath,
  uploadUrl,
  contentType,
}: {
  absolutePath: string;
  uploadUrl: string;
  contentType: string;
}): Promise<void> => {
  const buffer = await fs.promises.readFile(absolutePath);

  // Content-Length is part of the presigned signature, so the body has to be a
  // buffer axios can measure rather than a stream.
  await axios.put(uploadUrl, buffer, {
    headers: {
      'Content-Type': contentType,
      'Content-Length': buffer.length,
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });
};
