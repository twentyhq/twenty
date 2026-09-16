import { type WebClient } from '@slack/web-api';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { downloadSlackFile } from 'src/logic-functions/utils/download-slack-file';
import { importSlackAssistantAttachments } from 'src/logic-functions/utils/import-slack-assistant-attachments';
import { uploadFileToAgentChat } from 'src/logic-functions/utils/upload-file-to-agent-chat';

vi.mock('src/logic-functions/utils/download-slack-file');
vi.mock('src/logic-functions/utils/upload-file-to-agent-chat');
vi.mock('twenty-client-sdk/metadata', () => ({
  MetadataApiClient: vi.fn(),
}));

const PNG_FILE = {
  id: 'F1',
  name: 'screenshot.png',
  mimetype: 'image/png',
  url_private: 'https://files.slack.com/screenshot.png',
  size: 1024,
};

const slackClient = {
  files: { info: vi.fn() },
} as unknown as WebClient;

const importFiles = async (files: (typeof PNG_FILE)[]) =>
  await importSlackAssistantAttachments({
    client: slackClient,
    files,
    botToken: 'xoxb-token',
    deadlineAtMs: Date.now() + 60_000,
  });

describe('importSlackAssistantAttachments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(downloadSlackFile).mockResolvedValue({
      success: true,
      bytes: new Uint8Array([1]),
      contentType: 'image/png',
    });
    vi.mocked(uploadFileToAgentChat).mockResolvedValue('file-id-1');
  });

  it('should attach nothing when the message carries no files', async () => {
    expect(
      await importSlackAssistantAttachments({
        client: slackClient,
        files: undefined,
        botToken: 'xoxb-token',
        deadlineAtMs: Date.now() + 60_000,
      }),
    ).toEqual({ attachments: [], attachedFileNames: [], attachedSourceFiles: [] });
  });

  it('should attach nothing when the Slack connection has no token', async () => {
    expect(
      await importSlackAssistantAttachments({
        client: slackClient,
        files: [PNG_FILE],
        botToken: undefined,
        deadlineAtMs: Date.now() + 60_000,
      }),
    ).toEqual({ attachments: [], attachedFileNames: [], attachedSourceFiles: [] });

    expect(downloadSlackFile).not.toHaveBeenCalled();
  });

  it('should return the uploaded file id and name for a readable file', async () => {
    expect(await importFiles([PNG_FILE])).toEqual({
      attachments: [{ fileId: 'file-id-1', filename: 'screenshot.png' }],
      attachedFileNames: ['screenshot.png'],
      attachedSourceFiles: [PNG_FILE],
    });
  });

  it('should skip a file the agent cannot read without touching Slack', async () => {
    const result = await importFiles([
      { ...PNG_FILE, name: 'notes.txt', mimetype: 'text/plain' },
    ]);

    expect(result).toEqual({ attachments: [], attachedFileNames: [], attachedSourceFiles: [] });
    expect(downloadSlackFile).not.toHaveBeenCalled();
  });

  it('should keep going when one download fails', async () => {
    vi.mocked(downloadSlackFile)
      .mockResolvedValueOnce({ success: false, error: 'status 403' })
      .mockResolvedValueOnce({
        success: true,
        bytes: new Uint8Array([1]),
        contentType: 'image/png',
      });

    const result = await importFiles([
      PNG_FILE,
      { ...PNG_FILE, id: 'F2', name: 'chart.png' },
    ]);

    expect(result.attachedFileNames).toEqual(['chart.png']);
  });

  it('should keep going when one upload fails', async () => {
    vi.mocked(uploadFileToAgentChat)
      .mockRejectedValueOnce(new Error('upload failed with status 500'))
      .mockResolvedValueOnce('file-id-2');

    const result = await importFiles([
      PNG_FILE,
      { ...PNG_FILE, id: 'F2', name: 'chart.png' },
    ]);

    expect(result.attachments).toEqual([
      { fileId: 'file-id-2', filename: 'chart.png' },
    ]);
  });

  it('should stop at the runAgent attachment limit', async () => {
    const files = Array.from({ length: 12 }, (_, index) => ({
      ...PNG_FILE,
      id: `F${index}`,
      name: `screenshot-${index}.png`,
    }));

    const result = await importFiles(files);

    expect(result.attachments).toHaveLength(10);
  });

  it('should count the limit in imported files, not in attempts', async () => {
    vi.mocked(downloadSlackFile).mockResolvedValueOnce({
      success: false,
      error: 'status 403',
    });

    const files = Array.from({ length: 12 }, (_, index) => ({
      ...PNG_FILE,
      id: `F${index}`,
      name: `screenshot-${index}.png`,
    }));

    const result = await importFiles(files);

    expect(result.attachments).toHaveLength(10);
    expect(result.attachedFileNames).not.toContain('screenshot-0.png');
  });

  it('should attach nothing once the import window has already closed', async () => {
    const result = await importSlackAssistantAttachments({
      client: slackClient,
      files: [PNG_FILE],
      botToken: 'xoxb-token',
      deadlineAtMs: Date.now() - 1,
    });

    expect(result).toEqual({ attachments: [], attachedFileNames: [], attachedSourceFiles: [] });
    expect(downloadSlackFile).not.toHaveBeenCalled();
  });

  it('should leave the remaining files as names when the window closes mid-import', async () => {
    vi.mocked(uploadFileToAgentChat).mockImplementation(async () => {
      vi.setSystemTime(Date.now() + 61_000);

      return 'file-id-1';
    });
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const result = await importFiles([
      PNG_FILE,
      { ...PNG_FILE, id: 'F2', name: 'chart.png' },
    ]);

    vi.useRealTimers();

    expect(result.attachedFileNames).toEqual(['screenshot.png']);
  });

  it('should resolve a Slack Connect stub through files.info before reading it', async () => {
    vi.mocked(slackClient.files.info).mockResolvedValue({
      ok: true,
      file: PNG_FILE,
    });

    const result = await importFiles([
      {
        id: 'F1',
        file_access: 'check_file_info',
      } as unknown as typeof PNG_FILE,
    ]);

    expect(slackClient.files.info).toHaveBeenCalledWith({ file: 'F1' });
    expect(result.attachedFileNames).toEqual(['screenshot.png']);
    // the stub itself is reported, so the prompt drops it by identity rather
    // than by the placeholder name it shared with any other unnamed file
    expect(result.attachedSourceFiles).toHaveLength(1);
  });
});
