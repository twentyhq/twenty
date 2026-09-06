import { Test, type TestingModule } from '@nestjs/testing';

import { FileFolder } from 'twenty-shared/types';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { UploadFileTool } from 'src/engine/core-modules/tool/tools/upload-file-tool/upload-file-tool';

jest.mock('src/engine/core-modules/application/application.service', () => ({
  ApplicationService: class ApplicationService {},
}));

jest.mock(
  'src/engine/core-modules/file-storage/services/file-storage.service',
  () => ({
    FileStorageService: class FileStorageService {},
  }),
);

describe('UploadFileTool', () => {
  let tool: UploadFileTool;
  let mockWriteFile: jest.Mock;
  let mockFindApplications: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockWriteFile = jest.fn();
    mockFindApplications = jest.fn().mockResolvedValue({
      workspaceCustomFlatApplication: {
        universalIdentifier: 'workspace-custom-app',
      },
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadFileTool,
        {
          provide: FileStorageService,
          useValue: { writeFile: mockWriteFile },
        },
        {
          provide: ApplicationService,
          useValue: {
            findWorkspaceTwentyStandardAndCustomApplicationOrThrow:
              mockFindApplications,
          },
        },
      ],
    }).compile();

    tool = module.get(UploadFileTool);
  });

  it('should write the decoded file into AgentChat and return fileId', async () => {
    mockWriteFile.mockResolvedValue({
      id: 'file-1',
      path: 'agent-chat/mcp-upload/file-1/notes.txt',
      size: 5,
      mimeType: 'text/plain',
    });

    const result = await tool.execute(
      {
        filename: '/tmp/notes.txt',
        content: Buffer.from('hello').toString('base64'),
      },
      { workspaceId: 'workspace-1' },
    );

    expect(result.success).toBe(true);
    expect(result.result).toEqual({
      fileId: 'file-1',
      fullPath: 'agent-chat/mcp-upload/file-1/notes.txt',
      size: 5,
      mimeType: 'text/plain',
    });
    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.objectContaining({
        fileFolder: FileFolder.AgentChat,
        workspaceId: 'workspace-1',
        applicationUniversalIdentifier: 'workspace-custom-app',
        settings: {
          isTemporaryFile: true,
          toDelete: false,
        },
      }),
    );

    const writeFileArguments = mockWriteFile.mock.calls[0][0] as {
      resourcePath: string;
      sourceFile: Buffer;
    };

    expect(writeFileArguments.sourceFile).toEqual(Buffer.from('hello'));
    expect(writeFileArguments.resourcePath).toMatch(/^mcp-upload\/.+\.txt$/);
  });

  it('should reject a filename without an extension', async () => {
    const result = await tool.execute(
      {
        filename: 'notes',
        content: Buffer.from('hello').toString('base64'),
      },
      { workspaceId: 'workspace-1' },
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('is not allowed');
    expect(mockWriteFile).not.toHaveBeenCalled();
  });

  it('should return a storage error without throwing', async () => {
    mockWriteFile.mockRejectedValue(
      new FileStorageException(
        'extension mismatch',
        FileStorageExceptionCode.INVALID_EXTENSION,
      ),
    );

    const result = await tool.execute(
      {
        filename: 'notes.txt',
        content: Buffer.from('hello').toString('base64'),
      },
      { workspaceId: 'workspace-1' },
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('extension mismatch');
  });
});
