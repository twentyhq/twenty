import { type WebClient } from '@slack/web-api';
import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_ASSISTANT_ATTACHMENT_DOWNLOAD_TIMEOUT_MS } from 'src/logic-functions/constants/slack-assistant-attachment-download-timeout-ms';
import { SLACK_ASSISTANT_ATTACHMENT_UPLOAD_TIMEOUT_MS } from 'src/logic-functions/constants/slack-assistant-attachment-upload-timeout-ms';
import { SLACK_ASSISTANT_MAX_ATTACHMENTS } from 'src/logic-functions/constants/slack-assistant-max-attachments';
import { type ImportedSlackAttachments } from 'src/logic-functions/types/imported-slack-attachments.type';
import { type SlackAttachmentCandidate } from 'src/logic-functions/types/slack-attachment-candidate.type';
import { type SlackMessageFile } from 'src/logic-functions/types/slack-message-file.type';
import { downloadSlackFile } from 'src/logic-functions/utils/download-slack-file';
import { getSlackMessageFileNames } from 'src/logic-functions/utils/get-slack-message-file-names';
import { isSlackAttachmentCandidate } from 'src/logic-functions/utils/is-slack-attachment-candidate';
import { resolveSlackFileDetails } from 'src/logic-functions/utils/resolve-slack-file-details';
import { uploadFileToAgentChat } from 'src/logic-functions/utils/upload-file-to-agent-chat';

type ResolvedSlackFile = {
  resolved: SlackMessageFile;
  sourceFile: SlackMessageFile;
};

type ResolvedSlackAttachmentCandidate = ResolvedSlackFile & {
  resolved: SlackAttachmentCandidate;
};

const isResolvedAttachmentCandidate = (
  entry: ResolvedSlackFile,
): entry is ResolvedSlackAttachmentCandidate =>
  isSlackAttachmentCandidate(entry.resolved);

const NO_ATTACHMENTS: ImportedSlackAttachments = {
  attachments: [],
  attachedFileNames: [],
  attachedSourceFiles: [],
};

export const importSlackAssistantAttachments = async ({
  client,
  files,
  botToken,
  deadlineAtMs,
}: {
  client: WebClient | undefined;
  files: SlackMessageFile[] | undefined;
  botToken: string | undefined;
  deadlineAtMs: number;
}): Promise<ImportedSlackAttachments> => {
  if (
    !isNonEmptyArray(files) ||
    !isDefined(client) ||
    !isNonEmptyString(botToken) ||
    deadlineAtMs - Date.now() <= 0
  ) {
    return NO_ATTACHMENTS;
  }

  const resolvedFiles = await Promise.all(
    files.map(
      async (file): Promise<ResolvedSlackFile> => ({
        resolved: await resolveSlackFileDetails({ client, file }),
        sourceFile: file,
      }),
    ),
  );
  const candidates = resolvedFiles.filter(isResolvedAttachmentCandidate);

  if (!isNonEmptyArray(candidates)) {
    return NO_ATTACHMENTS;
  }

  const metadataClient = new MetadataApiClient({
    signal: AbortSignal.timeout(Math.max(deadlineAtMs - Date.now(), 1)),
  });
  const imported: ImportedSlackAttachments = {
    attachments: [],
    attachedFileNames: [],
    attachedSourceFiles: [],
  };

  for (const { resolved: candidate, sourceFile } of candidates) {
    if (imported.attachments.length >= SLACK_ASSISTANT_MAX_ATTACHMENTS) {
      break;
    }

    const remainingMs = deadlineAtMs - Date.now();

    if (remainingMs <= 0) {
      console.warn(
        '[slack] attachment import ran out of time, the remaining files stay names in the prompt',
      );

      break;
    }

    const [fileName = ''] = getSlackMessageFileNames([candidate]);
    const download = await downloadSlackFile({
      urlPrivate: candidate.url_private,
      mimeType: candidate.mimetype,
      botToken,
      timeoutMs: Math.min(
        SLACK_ASSISTANT_ATTACHMENT_DOWNLOAD_TIMEOUT_MS,
        remainingMs,
      ),
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
        timeoutMs: Math.min(
          SLACK_ASSISTANT_ATTACHMENT_UPLOAD_TIMEOUT_MS,
          Math.max(deadlineAtMs - Date.now(), 1),
        ),
      });

      imported.attachments.push({ fileId, filename: fileName });
      imported.attachedFileNames.push(fileName);
      imported.attachedSourceFiles.push(sourceFile);
    } catch (error) {
      console.warn(
        `[slack] attachment "${fileName}" stays a name in the prompt: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return imported;
};
