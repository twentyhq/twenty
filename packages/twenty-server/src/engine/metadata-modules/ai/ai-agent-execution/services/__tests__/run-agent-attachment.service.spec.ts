import { FileFolder } from 'twenty-shared/types';
import { In, Like } from 'typeorm';

import { RunAgentAttachmentService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/run-agent-attachment.service';

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
      }),
    ).toEqual([{ role: 'user', content: 'hello' }]);
    expect(fileRepository.find).not.toHaveBeenCalled();
  });
});
