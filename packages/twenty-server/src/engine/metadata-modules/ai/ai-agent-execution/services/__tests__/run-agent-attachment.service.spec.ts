import { type RunAgentMessage } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';

import { RunAgentAttachmentService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/run-agent-attachment.service';

const WORKSPACE_ID = 'workspace-id';
const FILE_ID = '6fdbd0ba-9a10-4b71-b0b7-2b1d64f8dc27';
const OTHER_FILE_ID = 'c1d3f0a8-8f4e-4a3f-9a7d-0f1d2e3b4c5d';

const buildService = ({
  files = [{ id: FILE_ID, mimeType: 'image/png' }],
}: {
  files?: { id: string; mimeType: string }[];
} = {}) => {
  const fileRepository = { find: jest.fn().mockResolvedValue(files) };
  const fileUrlService = {
    signFileByIdUrl: jest
      .fn()
      .mockImplementation(({ fileId }: { fileId: string }) =>
        Promise.resolve(
          `https://twenty.test/file/agent-chat/${fileId}?token=t`,
        ),
      ),
  };

  const service = new RunAgentAttachmentService(
    fileRepository as never,
    fileUrlService as never,
  );

  return { service, fileRepository, fileUrlService };
};

describe('RunAgentAttachmentService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('leaves messages without attachments as plain strings', async () => {
    const { service, fileRepository } = buildService();

    const messages: RunAgentMessage[] = [
      { role: 'user', content: 'hello' },
      { role: 'assistant', content: 'hi' },
    ];

    expect(
      await service.buildModelMessages({ messages, workspaceId: WORKSPACE_ID }),
    ).toEqual([
      { role: 'user', content: 'hello' },
      { role: 'assistant', content: 'hi' },
    ]);
    expect(fileRepository.find).not.toHaveBeenCalled();
  });

  it('turns an attachment into a file part carrying the stored media type', async () => {
    const { service } = buildService();

    const messages: RunAgentMessage[] = [
      {
        role: 'user',
        content: 'what is in this?',
        attachments: [{ fileId: FILE_ID, filename: 'screenshot.png' }],
      },
    ];

    expect(
      await service.buildModelMessages({ messages, workspaceId: WORKSPACE_ID }),
    ).toEqual([
      {
        role: 'user',
        content: [
          { type: 'text', text: 'what is in this?' },
          {
            type: 'file',
            data: `https://twenty.test/file/agent-chat/${FILE_ID}?token=t`,
            mediaType: 'image/png',
            filename: 'screenshot.png',
          },
        ],
      },
    ]);
  });

  it('only looks for files the workspace stored in the agent chat folder', async () => {
    const { service, fileRepository } = buildService();

    await service.buildModelMessages({
      messages: [
        { role: 'user', content: 'hi', attachments: [{ fileId: FILE_ID }] },
      ],
      workspaceId: WORKSPACE_ID,
    });

    expect(fileRepository.find).toHaveBeenCalledWith(
      WORKSPACE_ID,
      expect.objectContaining({
        where: expect.objectContaining({
          path: expect.objectContaining({
            _value: `${FileFolder.AgentChat}/%`,
          }),
          status: 'UPLOADED',
        }),
      }),
    );
  });

  it('rejects an attachment it cannot resolve rather than answering without it', async () => {
    const { service } = buildService({ files: [] });

    await expect(
      service.buildModelMessages({
        messages: [
          { role: 'user', content: 'hi', attachments: [{ fileId: FILE_ID }] },
        ],
        workspaceId: WORKSPACE_ID,
      }),
    ).rejects.toThrow(FILE_ID);
  });

  it('rejects attachments on an assistant message', async () => {
    const { service } = buildService();

    await expect(
      service.buildModelMessages({
        messages: [
          {
            role: 'assistant',
            content: 'here you go',
            attachments: [{ fileId: FILE_ID }],
          },
        ],
        workspaceId: WORKSPACE_ID,
      }),
    ).rejects.toThrow('Only user messages can carry attachments');
  });

  it('signs each distinct file once when a conversation reuses it', async () => {
    const { service, fileUrlService } = buildService({
      files: [
        { id: FILE_ID, mimeType: 'image/png' },
        { id: OTHER_FILE_ID, mimeType: 'application/pdf' },
      ],
    });

    await service.buildModelMessages({
      messages: [
        { role: 'user', content: 'one', attachments: [{ fileId: FILE_ID }] },
        { role: 'assistant', content: 'ok' },
        {
          role: 'user',
          content: 'two',
          attachments: [{ fileId: FILE_ID }, { fileId: OTHER_FILE_ID }],
        },
      ],
      workspaceId: WORKSPACE_ID,
    });

    expect(fileUrlService.signFileByIdUrl).toHaveBeenCalledTimes(2);
  });

  it('omits the text part when an attachment arrives with no caption', async () => {
    const { service } = buildService();

    const [message] = await service.buildModelMessages({
      messages: [
        { role: 'user', content: '', attachments: [{ fileId: FILE_ID }] },
      ],
      workspaceId: WORKSPACE_ID,
    });

    expect(message.content).toEqual([
      expect.objectContaining({ type: 'file' }),
    ]);
  });
});
