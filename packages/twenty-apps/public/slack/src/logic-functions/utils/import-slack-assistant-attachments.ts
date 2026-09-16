import { type WebClient } from '@slack/web-api';
import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_ASSISTANT_MAX_ATTACHMENTS } from 'src/logic-functions/constants/slack-assistant-max-attachments';
import { type ImportedSlackAttachments } from 'src/logic-functions/types/imported-slack-attachments.type';
import { type SlackMessageFile } from 'src/logic-functions/types/slack-message-file.type';
import { downloadSlackFile } from 'src/logic-functions/utils/download-slack-file';
import { getSlackMessageFileNames } from 'src/logic-functions/utils/get-slack-message-file-names';
import { isSlackAttachmentCandidate } from 'src/logic-functions/utils/is-slack-attachment-candidate';
import { resolveSlackFileDetails } from 'src/logic-functions/utils/resolve-slack-file-details';
import { uploadFileToAgentChat } from 'src/logic-functions/utils/upload-file-to-agent-chat';

const NO_ATTACHMENTS: ImportedSlackAttachments = {
  attachments: [],
  attachedFileNames: [],
};

export const importSlackAssistantAttachments = async ({
  client,
  files,
  botToken,
}: {
  client: WebClient | undefined;
  files: SlackMessageFile[] | undefined;
  botToken: string | undefined;
}): Promise<ImportedSlackAttachments> => {
  if (
    !isNonEmptyArray(files) ||
    !isDefined(client) ||
    !isNonEmptyString(botToken)
  ) {
    return NO_ATTACHMENTS;
  }

  const resolvedFiles = await Promise.all(
    files.map(async (file) => await resolveSlackFileDetails({ client, file })),
  );
  const candidates = resolvedFiles
    .filter(isSlackAttachmentCandidate)
    .slice(0, SLACK_ASSISTANT_MAX_ATTACHMENTS);

  if (!isNonEmptyArray(candidates)) {
    return NO_ATTACHMENTS;
  }

  const metadataClient = new MetadataApiClient();
  const imported: ImportedSlackAttachments = {
    attachments: [],
    attachedFileNames: [],
  };

  for (const candidate of candidates) {
    const [fileName] = getSlackMessageFileNames([candidate]);
    const download = await downloadSlackFile({
      urlPrivate: candidate.url_private,
      mimeType: candidate.mimetype,
      botToken,
    });

    if (!download.success) {
      console.warn(
        `[slack] attachment "${fileName}" stays a name in the prompt: ${download.error}`,
      );

      continue;
    }

    try {
      const fileId = await uploadFileToAgentChat({
        metadataClient,
        fileName,
        bytes: download.bytes,
      });

      imported.attachments.push({ fileId, filename: fileName });
      imported.attachedFileNames.push(fileName);
    } catch (error) {
      console.warn(
        `[slack] attachment "${fileName}" stays a name in the prompt: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return imported;
};
