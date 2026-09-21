import axios from 'axios';
import * as fs from 'fs';

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

  await axios.put(uploadUrl, buffer, {
    headers: {
      'Content-Type': contentType,
      'Content-Length': buffer.length,
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });
};
