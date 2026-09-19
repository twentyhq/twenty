import { type WebClient } from '@slack/web-api';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type SlackMessageFile } from 'src/logic-functions/types/slack-message-file.type';
import { getSlackConnection } from 'src/logic-functions/utils/get-slack-connection';
import { importSlackAssistantAttachments } from 'src/logic-functions/utils/import-slack-assistant-attachments';
import { resolveSlackAssistantAttachments } from 'src/logic-functions/utils/resolve-slack-assistant-attachments';

vi.mock('src/logic-functions/utils/get-slack-connection');
vi.mock('src/logic-functions/utils/import-slack-assistant-attachments');

const slackClient = {} as WebClient;

const PNG_FILE: SlackMessageFile = {
  id: 'F1',
  name: 'screenshot.png',
  mimetype: 'image/png',
  url_private: 'https://files.slack.com/screenshot.png',
};

const SPREADSHEET_FILE: SlackMessageFile = {
  id: 'F2',
  name: 'numbers.xlsx',
};

const resolveWith = async ({
  requestFiles,
  sharedFiles,
}: {
  requestFiles?: SlackMessageFile[];
  sharedFiles: SlackMessageFile[];
}) =>
  await resolveSlackAssistantAttachments({
    slackClient,
    requestFiles,
    sharedFiles,
    agentDeadlineAtMs: Date.now() + 300_000,
  });

describe('resolveSlackAssistantAttachments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSlackConnection).mockResolvedValue({
      success: true,
      accessToken: 'xoxb-token',
      connectionId: 'connection-1',
    });
    vi.mocked(importSlackAssistantAttachments).mockResolvedValue({
      attachments: [],
      attachedFileNames: [],
      attachedSourceFiles: [],
    });
  });

  it('should not look the bot token up when the request carries no file', async () => {
    await resolveWith({ requestFiles: undefined, sharedFiles: [] });

    expect(getSlackConnection).not.toHaveBeenCalled();
    expect(importSlackAssistantAttachments).toHaveBeenCalledWith(
      expect.objectContaining({ botToken: undefined }),
    );
  });

  it('should import with the bot token of the workspace connection', async () => {
    await resolveWith({ requestFiles: [PNG_FILE], sharedFiles: [PNG_FILE] });

    expect(importSlackAssistantAttachments).toHaveBeenCalledWith(
      expect.objectContaining({ botToken: 'xoxb-token', files: [PNG_FILE] }),
    );
  });

  it('should import without a token when the Slack connection cannot be read', async () => {
    vi.mocked(getSlackConnection).mockResolvedValue({
      success: false,
      error: 'Slack is not connected.',
    });

    await resolveWith({ requestFiles: [PNG_FILE], sharedFiles: [PNG_FILE] });

    expect(importSlackAssistantAttachments).toHaveBeenCalledWith(
      expect.objectContaining({ botToken: undefined }),
    );
  });

  it('should leave the agent a budget the import cannot spend', async () => {
    const agentDeadlineAtMs = Date.now() + 300_000;

    await resolveSlackAssistantAttachments({
      slackClient,
      requestFiles: [PNG_FILE],
      sharedFiles: [PNG_FILE],
      agentDeadlineAtMs,
    });

    const [{ deadlineAtMs }] = vi.mocked(importSlackAssistantAttachments).mock
      .calls[0];

    expect(deadlineAtMs).toBeLessThanOrEqual(agentDeadlineAtMs - 60_000);
  });

  it('should list a shared file the import did not take as a name only', async () => {
    const { namesOnlyFileNames } = await resolveWith({
      requestFiles: [PNG_FILE],
      sharedFiles: [PNG_FILE, SPREADSHEET_FILE],
    });

    expect(namesOnlyFileNames).toEqual(['screenshot.png', 'numbers.xlsx']);
  });

  it('should drop an imported file from the names-only list', async () => {
    vi.mocked(importSlackAssistantAttachments).mockResolvedValue({
      attachments: [{ fileId: 'file-id-1', filename: 'screenshot.png' }],
      attachedFileNames: ['screenshot.png'],
      attachedSourceFiles: [PNG_FILE],
    });

    const { namesOnlyFileNames } = await resolveWith({
      requestFiles: [PNG_FILE],
      sharedFiles: [PNG_FILE, SPREADSHEET_FILE],
    });

    expect(namesOnlyFileNames).toEqual(['numbers.xlsx']);
  });

  it('should list a file shared on several messages of the thread once', async () => {
    const { namesOnlyFileNames } = await resolveWith({
      sharedFiles: [SPREADSHEET_FILE, { ...SPREADSHEET_FILE }],
    });

    expect(namesOnlyFileNames).toEqual(['numbers.xlsx']);
  });

  it('should keep two files that only share a name apart', async () => {
    const { namesOnlyFileNames } = await resolveWith({
      sharedFiles: [SPREADSHEET_FILE, { ...SPREADSHEET_FILE, id: 'F3' }],
    });

    expect(namesOnlyFileNames).toEqual(['numbers.xlsx', 'numbers.xlsx']);
  });

  it('should keep two unnamed files without an id apart', async () => {
    const { namesOnlyFileNames } = await resolveWith({
      sharedFiles: [{}, {}],
    });

    expect(namesOnlyFileNames).toEqual(['an unnamed file', 'an unnamed file']);
  });
});
