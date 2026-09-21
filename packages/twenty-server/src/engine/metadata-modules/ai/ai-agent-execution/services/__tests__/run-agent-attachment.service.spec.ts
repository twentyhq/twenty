import { FileFolder } from 'twenty-shared/types';
import { In, Like } from 'typeorm';

import { RunAgentAttachmentService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/run-agent-attachment.service';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';

const WORKSPACE_ID = 'workspace-id';
const FILE_ID = '6fdbd0ba-9a10-4b71-b0b7-2b1d64f8dc27';

describe('RunAgentAttachmentService', () => {
  it('resolves attachments only against uploaded agent chat files of the workspace', async () => {
    const fileRepository = {
      find: jest
        .fn()
        .mockResolvedValue([{ id: FILE_ID, mimeType: 'image/png' }]),
    };
    const service = new RunAgentAttachmentService(
      fileRepository as never,
      {
        signFileByIdUrl: jest
          .fn()
          .mockResolvedValue('https://twenty.test/file'),
      } as never,
    );

    await service.buildModelMessagesOrThrow({
      messages: [
        { role: 'user', content: 'hi', attachments: [{ fileId: FILE_ID }] },
      ],
      workspaceId: WORKSPACE_ID,
      modalities: ['image'],
    });

    expect(fileRepository.find).toHaveBeenCalledWith(WORKSPACE_ID, {
      where: {
        id: In([FILE_ID]),
        path: Like(`${FileFolder.AgentChat}/%`),
        status: 'UPLOADED',
      },
    });
  });

  it('does not query files for a conversation that carries no attachment', async () => {
    const fileRepository = { find: jest.fn() };
    const service = new RunAgentAttachmentService(
      fileRepository as never,
      {
        signFileByIdUrl: jest.fn(),
      } as never,
    );

    expect(
      await service.buildModelMessagesOrThrow({
        messages: [{ role: 'user', content: 'hello' }],
        workspaceId: WORKSPACE_ID,
        modalities: ['image'],
      }),
    ).toEqual([{ role: 'user', content: 'hello' }]);
    expect(fileRepository.find).not.toHaveBeenCalled();
  });

  it('hands a supported attachment to the model as a file part', async () => {
    const fileRepository = {
      find: jest
        .fn()
        .mockResolvedValue([{ id: FILE_ID, mimeType: 'image/png' }]),
    };
    const service = new RunAgentAttachmentService(
      fileRepository as never,
      {
        signFileByIdUrl: jest
          .fn()
          .mockResolvedValue('https://twenty.test/file'),
      } as never,
    );

    expect(
      await service.buildModelMessagesOrThrow({
        messages: [
          {
            role: 'user',
            content: 'what is in this?',
            attachments: [{ fileId: FILE_ID, filename: 'screenshot.png' }],
          },
        ],
        workspaceId: WORKSPACE_ID,
        modalities: ['image'],
      }),
    ).toEqual([
      {
        role: 'user',
        content: [
          { type: 'text', text: 'what is in this?' },
          {
            type: 'file',
            data: 'https://twenty.test/file',
            mediaType: 'image/png',
            filename: 'screenshot.png',
          },
        ],
      },
    ]);
  });

  it('degrades an attachment the resolved model cannot read into text', async () => {
    const fileRepository = {
      find: jest
        .fn()
        .mockResolvedValue([{ id: FILE_ID, mimeType: 'application/pdf' }]),
    };
    const service = new RunAgentAttachmentService(
      fileRepository as never,
      {
        signFileByIdUrl: jest
          .fn()
          .mockResolvedValue('https://twenty.test/file'),
      } as never,
    );

    expect(
      await service.buildModelMessagesOrThrow({
        messages: [
          {
            role: 'user',
            content: 'summarize this',
            attachments: [{ fileId: FILE_ID, filename: 'report.pdf' }],
          },
        ],
        workspaceId: WORKSPACE_ID,
        modalities: ['image'],
      }),
    ).toEqual([
      {
        role: 'user',
        content: [
          { type: 'text', text: 'summarize this' },
          {
            type: 'text',
            text: '[Attached file: report.pdf (type: application/pdf) — file type is not supported for direct analysis]',
          },
        ],
      },
    ]);
  });

  it('still refuses a file id that resolves to nothing in the workspace', async () => {
    const fileRepository = { find: jest.fn().mockResolvedValue([]) };
    const service = new RunAgentAttachmentService(
      fileRepository as never,
      {
        signFileByIdUrl: jest.fn(),
      } as never,
    );

    await expect(
      service.buildModelMessagesOrThrow({
        messages: [
          { role: 'user', content: 'hi', attachments: [{ fileId: FILE_ID }] },
        ],
        workspaceId: WORKSPACE_ID,
        modalities: ['image'],
      }),
    ).rejects.toThrow(
      expect.objectContaining({ code: AiExceptionCode.INVALID_AGENT_INPUT }),
    );
  });
});
