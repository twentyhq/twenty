import { ForbiddenException } from '@nestjs/common';
import { type Response } from 'express';

import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { RecordExportController } from 'src/engine/core-modules/record-export/record-export.controller';
import { RecordExportQueryWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export-query.workspace-service';
import { RecordExportWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export.workspace-service';

describe('RecordExportController', () => {
  const exports = {
    findOrThrow: jest.fn(),
    assertDownloadable: jest.fn(),
    getFileResource: jest.fn(),
  };
  const query = {
    resolveRequester: jest.fn(),
    buildContext: jest.fn(),
    readPage: jest.fn(),
  };
  const storage = { getPresignedUrl: jest.fn() };
  const jwt = { verifyJwtToken: jest.fn() };
  const response = { setHeader: jest.fn(), redirect: jest.fn() };
  const controller = new RecordExportController(
    exports as unknown as RecordExportWorkspaceService,
    query as unknown as RecordExportQueryWorkspaceService,
    storage as unknown as FileStorageService,
    jwt as unknown as JwtWrapperService,
  );

  beforeEach(() => {
    jest.resetAllMocks();
    jwt.verifyJwtToken.mockResolvedValue({
      type: JwtTokenTypeEnum.FILE,
      workspaceId: 'workspace',
      fileId: 'export',
    });
    exports.findOrThrow.mockResolvedValue({
      id: 'export',
      workspaceId: 'workspace',
      filename: 'person.csv',
      filePath: 'export/file.csv',
      parameters: {},
    });
    exports.getFileResource.mockReturnValue({
      workspaceId: 'workspace',
      resourcePath: 'export/file.csv',
    });
    query.resolveRequester.mockResolvedValue({ type: 'user' });
    query.buildContext.mockResolvedValue({});
    storage.getPresignedUrl.mockResolvedValue('https://storage.example/file');
  });

  it.each([
    {
      type: JwtTokenTypeEnum.FILE,
      fileId: 'other-export',
      workspaceId: 'workspace',
    },
    {
      type: JwtTokenTypeEnum.ACCESS,
      fileId: 'export',
      workspaceId: 'workspace',
    },
    { type: JwtTokenTypeEnum.FILE, fileId: 'export' },
  ])('rejects tokens that do not authorize this export', async (payload) => {
    jwt.verifyJwtToken.mockResolvedValue(payload);
    await expect(
      controller.download('export', 'token', response as unknown as Response),
    ).rejects.toThrow(ForbiddenException);
    expect(exports.findOrThrow).not.toHaveBeenCalled();
    expect(storage.getPresignedUrl).not.toHaveBeenCalled();
  });

  it('rejects an expired or invalid signature before accessing the file', async () => {
    jwt.verifyJwtToken.mockRejectedValue(new Error('Expired signature'));
    await expect(
      controller.download('export', 'token', response as unknown as Response),
    ).rejects.toThrow(ForbiddenException);
    expect(exports.findOrThrow).not.toHaveBeenCalled();
  });

  it('does not serve a prepared file after read access is revoked', async () => {
    query.readPage.mockRejectedValue(new ForbiddenException());
    await expect(
      controller.download('export', 'token', response as unknown as Response),
    ).rejects.toThrow(ForbiddenException);
    expect(storage.getPresignedUrl).not.toHaveBeenCalled();
  });

  it('serves completed files using an expiring attachment URL after checking access', async () => {
    await controller.download(
      'export',
      'token',
      response as unknown as Response,
    );
    expect(exports.findOrThrow).toHaveBeenCalledWith('workspace', 'export');
    expect(query.resolveRequester).toHaveBeenCalled();
    expect(query.readPage).toHaveBeenCalledWith({}, {}, undefined, 0);
    expect(storage.getPresignedUrl).toHaveBeenCalledWith(
      expect.objectContaining({
        expiresInSeconds: 60,
        responseContentDisposition: 'attachment; filename="person.csv"',
        responseCacheControl: 'private, no-store',
      }),
    );
    expect(response.redirect).toHaveBeenCalledWith(
      'https://storage.example/file',
    );
  });
});
