import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';

import { SLACK_FILE_ACCESS_CHECK_FILE_INFO } from 'src/logic-functions/constants/slack-file-access-check-file-info';
import { type SlackMessageFile } from 'src/logic-functions/types/slack-message-file.type';

export const resolveSlackFileDetails = async ({
  client,
  file,
}: {
  client: WebClient;
  file: SlackMessageFile;
}): Promise<SlackMessageFile> => {
  if (
    file.file_access !== SLACK_FILE_ACCESS_CHECK_FILE_INFO ||
    !isNonEmptyString(file.id)
  ) {
    return file;
  }

  try {
    const response = await client.files.info({ file: file.id });

    return { ...file, ...(response.file as SlackMessageFile) };
  } catch (error) {
    console.warn(
      `[slack] files.info failed for ${file.id}, the file stays a name in the prompt: ${error instanceof Error ? error.message : String(error)}`,
    );

    return file;
  }
};
