import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

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
    const { file: resolvedFile } = await client.files.info({ file: file.id });

    if (!isDefined(resolvedFile)) {
      return file;
    }

    return {
      ...file,
      name: resolvedFile.name,
      title: resolvedFile.title,
      mimetype: resolvedFile.mimetype,
      size: resolvedFile.size,
      url_private: resolvedFile.url_private,
      file_access: resolvedFile.file_access,
    };
  } catch (error) {
    console.warn(
      `[slack] files.info failed for ${file.id}, the file stays a name in the prompt: ${error instanceof Error ? error.message : String(error)}`,
    );

    return file;
  }
};
