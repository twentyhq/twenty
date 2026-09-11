import { Test, type TestingModule } from '@nestjs/testing';

import { msg } from '@lingui/core/macro';
import { FileFolder } from 'twenty-shared/types';

import {
  FileUploadException,
  FileUploadExceptionCode,
} from 'src/engine/core-modules/file/file-upload/file-upload.exception';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { CreateFileUploadTool } from 'src/engine/core-modules/tool/tools/file-upload-tool/create-file-upload-tool';
import { type CreateFileUploadToolInput } from 'src/engine/core-modules/tool/tools/file-upload-tool/types/create-file-upload-tool-input.type';

const baseInput: CreateFileUploadToolInput = {
  filename: 'notes.txt',
  size: 5,
};

describe('CreateFileUploadTool', () => {
  let tool: CreateFileUploadTool;
  let mockCreateFileUpload: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockCreateFileUpload = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateFileUploadTool,
        {
          provide: FileUploadService,
          useValue: { createFileUpload: mockCreateFileUpload },
        },
      ],
    }).compile();

    tool = module.get(CreateFileUploadTool);
  });

  it('should create an AgentChat upload target', async () => {
    const expiresAt = new Date('2026-09-08T00:00:00.000Z');

    mockCreateFileUpload.mockResolvedValue({
      fileId: 'file-1',
      uploadUrl: 'https://storage.example/upload',
      contentType: 'application/octet-stream',
      expiresAt,
    });

    const result = await tool.execute(baseInput, {
      workspaceId: 'workspace-1',
    });

    expect(result.success).toBe(true);
    expect(result.result).toEqual({
      fileId: 'file-1',
      uploadUrl: 'https://storage.example/upload',
      contentType: 'application/octet-stream',
      expiresAt,
    });
    expect(mockCreateFileUpload).toHaveBeenCalledTimes(1);
    expect(mockCreateFileUpload).toHaveBeenCalledWith({
      workspaceId: 'workspace-1',
      filename: 'notes.txt',
      size: 5,
      fileFolder: FileFolder.AgentChat,
    });
  });

  it('should return a file upload error without throwing', async () => {
    mockCreateFileUpload.mockRejectedValue(
      new FileUploadException(
        'Invalid file size 2000000000 (max 1000000000 bytes)',
        FileUploadExceptionCode.FILE_TOO_LARGE,
        {
          userFriendlyMessage: msg`The file is empty or exceeds the maximum allowed size.`,
        },
      ),
    );

    const result = await tool.execute(
      { filename: 'notes.txt', size: 2000000000 },
      { workspaceId: 'workspace-1' },
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid file size');
    expect(mockCreateFileUpload).toHaveBeenCalledTimes(1);
    expect(mockCreateFileUpload).toHaveBeenCalledWith({
      workspaceId: 'workspace-1',
      filename: 'notes.txt',
      size: 2000000000,
      fileFolder: FileFolder.AgentChat,
    });
  });

  it.each([
    ['a non positive size', { filename: 'notes.txt', size: 0 }],
    ['a fractional size', { filename: 'notes.txt', size: 12.5 }],
    ['a non string filename', { filename: 12345, size: 5 }],
    ['a missing filename', { size: 5 }],
    ['no argument at all', {}],
  ])('should reject %s before reaching the service', async (_label, input) => {
    const result = await tool.execute(input, { workspaceId: 'workspace-1' });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid input for create file upload');
    expect(mockCreateFileUpload).not.toHaveBeenCalled();
  });
});
