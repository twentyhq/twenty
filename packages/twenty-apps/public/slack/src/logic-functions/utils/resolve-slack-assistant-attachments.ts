import { type WebClient } from '@slack/web-api';
import { isNonEmptyArray } from '@sniptt/guards';

import { SLACK_ASSISTANT_AGENT_MIN_BUDGET_MS } from 'src/logic-functions/constants/slack-assistant-agent-min-budget-ms';
import { SLACK_ASSISTANT_ATTACHMENT_IMPORT_MAX_MS } from 'src/logic-functions/constants/slack-assistant-attachment-import-max-ms';
import { type SlackAssistantAttachment } from 'src/logic-functions/types/slack-assistant-attachment.type';
import { type SlackMessageFile } from 'src/logic-functions/types/slack-message-file.type';
import { getSlackConnection } from 'src/logic-functions/utils/get-slack-connection';
import { getSlackMessageFileNames } from 'src/logic-functions/utils/get-slack-message-file-names';
import { importSlackAssistantAttachments } from 'src/logic-functions/utils/import-slack-assistant-attachments';

type ResolvedSlackAssistantAttachments = {
  attachments: SlackAssistantAttachment[];
  attachedFileNames: string[];
  namesOnlyFileNames: string[];
};

// two shared files can carry one name, and one shared file can appear on
// several messages of the thread, so files are told apart by id or by identity
const getSlackFileIdentity = (
  file: SlackMessageFile,
): string | SlackMessageFile => file.id ?? file;

const buildNamesOnlyFileNames = ({
  sharedFiles,
  attachedSourceFiles,
}: {
  sharedFiles: SlackMessageFile[];
  attachedSourceFiles: SlackMessageFile[];
}): string[] => {
  const attachedIdentities = new Set(
    attachedSourceFiles.map(getSlackFileIdentity),
  );
  const uniqueSharedFiles = new Map(
    sharedFiles.map((file) => [getSlackFileIdentity(file), file]),
  );

  return getSlackMessageFileNames(
    [...uniqueSharedFiles.entries()]
      .filter(([identity]) => !attachedIdentities.has(identity))
      .map(([, file]) => file),
  );
};

const resolveSlackBotToken = async (): Promise<string | undefined> => {
  const connection = await getSlackConnection();

  if (!connection.success) {
    console.warn(
      `[slack] shared files stay names in the prompt, the bot token is unavailable: ${connection.error}`,
    );

    return undefined;
  }

  return connection.accessToken;
};

export const resolveSlackAssistantAttachments = async ({
  slackClient,
  requestFiles,
  sharedFiles,
  agentDeadlineAtMs,
}: {
  slackClient: WebClient | undefined;
  requestFiles: SlackMessageFile[] | undefined;
  sharedFiles: SlackMessageFile[];
  agentDeadlineAtMs: number;
}): Promise<ResolvedSlackAssistantAttachments> => {
  const { attachments, attachedFileNames, attachedSourceFiles } =
    await importSlackAssistantAttachments({
      client: slackClient,
      files: requestFiles,
      botToken: isNonEmptyArray(requestFiles)
        ? await resolveSlackBotToken()
        : undefined,
      deadlineAtMs: Math.min(
        Date.now() + SLACK_ASSISTANT_ATTACHMENT_IMPORT_MAX_MS,
        agentDeadlineAtMs - SLACK_ASSISTANT_AGENT_MIN_BUDGET_MS,
      ),
    });

  return {
    attachments,
    attachedFileNames,
    namesOnlyFileNames: buildNamesOnlyFileNames({
      sharedFiles,
      attachedSourceFiles,
    }),
  };
};
