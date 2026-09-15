import { Readable, Writable } from 'node:stream';
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
    cancel: jest.fn(),
  };
  const query = {
    resolveRequester: jest.fn(),
    buildContext: jest.fn(),
    readPage: jest.fn(),
  };
  const storage = { readFile: jest.fn() };
  const jwt = { verifyJwtToken: jest.fn() };
  let output: string;
  let response: Writable & { setHeader: jest.Mock };

  const controller = new RecordExportController(
    exports as unknown as RecordExportWorkspaceService,
    query as unknown as RecordExportQueryWorkspaceService,
    storage as unknown as FileStorageService,
    jwt as unknown as JwtWrapperService,
  );

  beforeEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
    output = '';
    response = Object.assign(
      new Writable({
        write(chunk, _encoding, callback) {
          output += chunk.toString();
          callback();
        },
      }),
      { setHeader: jest.fn() },
    );
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
    storage.readFile.mockImplementation(async () =>
      Readable.from(['Id,Name\n1,Ada\n']),
    );
    exports.cancel.mockResolvedValue(undefined);
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
    expect(storage.readFile).not.toHaveBeenCalled();
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
    expect(storage.readFile).not.toHaveBeenCalled();
  });

  it('streams the file as an attachment and deletes it after transfer', async () => {
    await controller.download(
      'export',
      'token',
      response as unknown as Response,
    );
    expect(query.readPage).toHaveBeenCalledWith({}, {}, undefined, 0);
    expect(response.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename="person.csv"',
    );
    expect(output).toBe('Id,Name\n1,Ada\n');
    expect(exports.cancel).toHaveBeenCalledWith('workspace', 'export');
  });

  it('cleans up when the file transfer fails', async () => {
    storage.readFile.mockResolvedValue(
      Readable.from(
        (async function* () {
          yield 'Id,Name\n';
          throw new Error('Storage disconnected');
        })(),
      ),
    );
    await expect(
      controller.download('export', 'token', response as unknown as Response),
    ).rejects.toThrow('Storage disconnected');
    expect(exports.cancel).toHaveBeenCalledWith('workspace', 'export');
  });
});
