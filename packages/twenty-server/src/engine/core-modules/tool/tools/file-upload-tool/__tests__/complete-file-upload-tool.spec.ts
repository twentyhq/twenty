import { Test, type TestingModule } from '@nestjs/testing';

import { msg } from '@lingui/core/macro';

import {
  FileUploadException,
  FileUploadExceptionCode,
} from 'src/engine/core-modules/file/file-upload/file-upload.exception';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { CompleteFileUploadTool } from 'src/engine/core-modules/tool/tools/file-upload-tool/complete-file-upload-tool';
import { type CompleteFileUploadToolInput } from 'src/engine/core-modules/tool/tools/file-upload-tool/types/complete-file-upload-tool-input.type';

const baseInput: CompleteFileUploadToolInput = {
  fileId: '20202020-0000-4000-8000-000000000001',
};

describe('CompleteFileUploadTool', () => {
  let tool: CompleteFileUploadTool;
  let mockCompleteFileUpload: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockCompleteFileUpload = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompleteFileUploadTool,
        {
          provide: FileUploadService,
          useValue: { completeFileUpload: mockCompleteFileUpload },
        },
      ],
    }).compile();

    tool = module.get(CompleteFileUploadTool);
  });

  it('should complete the upload and return file metadata', async () => {
    mockCompleteFileUpload.mockResolvedValue({
      id: baseInput.fileId,
      path: 'agent-chat/file-1.txt',
      mimeType: 'text/plain',
      size: 5,
    });

    const result = await tool.execute(baseInput, {
      workspaceId: 'workspace-1',
    });

    expect(result.success).toBe(true);
    expect(result.result).toEqual({
      fileId: baseInput.fileId,
      path: 'agent-chat/file-1.txt',
      mimeType: 'text/plain',
      size: 5,
    });
    expect(mockCompleteFileUpload).toHaveBeenCalledTimes(1);
    expect(mockCompleteFileUpload).toHaveBeenCalledWith({
      workspaceId: 'workspace-1',
      fileId: baseInput.fileId,
    });
  });

  it('should return a file upload error without throwing', async () => {
    mockCompleteFileUpload.mockRejectedValue(
      new FileUploadException(
        `File not found: ${baseInput.fileId}`,
        FileUploadExceptionCode.FILE_NOT_FOUND,
        { userFriendlyMessage: msg`File not found.` },
      ),
    );

    const result = await tool.execute(baseInput, {
      workspaceId: 'workspace-1',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe(`File not found: ${baseInput.fileId}`);
    expect(mockCompleteFileUpload).toHaveBeenCalledTimes(1);
    expect(mockCompleteFileUpload).toHaveBeenCalledWith({
      workspaceId: 'workspace-1',
      fileId: baseInput.fileId,
    });
  });
});
