import { Readable } from 'node:stream';
import { Test } from '@nestjs/testing';
import { Like } from 'typeorm';
import { FileFolder } from 'twenty-shared/types';

import { ApplicationPublicAssetExportService } from 'src/engine/core-modules/application/application-manifest/services/application-public-asset-export.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

const workspaceId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const applicationId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const applicationUniversalIdentifier = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

describe('ApplicationPublicAssetExportService', () => {
  const repository = { find: jest.fn() };
  const storage = { readFile: jest.fn() };
  let service: ApplicationPublicAssetExportService;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        ApplicationPublicAssetExportService,
        {
          provide: getWorkspaceScopedRepositoryToken(FileEntity),
          useValue: repository,
        },
        { provide: FileStorageService, useValue: storage },
      ],
    }).compile();
    service = module.get(ApplicationPublicAssetExportService);
  });

  it('restricts export to uploaded public assets of the workspace and application', async () => {
    const bytes = Buffer.from([0, 255, 128, 254]);
    repository.find.mockResolvedValue([
      { path: 'public-asset/public/fonts/font.woff2' },
    ]);
    storage.readFile.mockResolvedValue(Readable.from([bytes]));
    const result = await service.exportPublicAssets({
      workspaceId,
      applicationId,
      applicationUniversalIdentifier,
    });

    expect(repository.find).toHaveBeenCalledWith(workspaceId, {
      where: {
        applicationId,
        path: Like('public-asset/public/%'),
        status: 'UPLOADED',
      },
      order: { path: 'ASC' },
    });
    expect(storage.readFile).toHaveBeenCalledWith({
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.PublicAsset,
      resourcePath: 'public/fonts/font.woff2',
    });
    expect(result.files).toEqual([
      {
        folder: 'public-asset',
        path: 'public/fonts/font.woff2',
        content: bytes.toString('base64'),
      },
    ]);
    expect(result.publicAssets).toEqual([
      {
        filePath: 'public/fonts/font.woff2',
        fileName: 'font.woff2',
        fileType: 'woff2',
        checksum: expect.stringMatching(/^[a-f0-9]{32}$/),
      },
    ]);
  });

  it('bounds the total binary content across assets', async () => {
    repository.find.mockResolvedValue([
      { path: 'public-asset/public/first.png' },
      { path: 'public-asset/public/second.png' },
    ]);
    storage.readFile.mockImplementation(async () =>
      Readable.from([Buffer.alloc(8 * 1024 * 1024)]),
    );
    await expect(
      service.exportPublicAssets({
        workspaceId,
        applicationId,
        applicationUniversalIdentifier,
      }),
    ).rejects.toThrow('Stream exceeds maximum allowed size');
  });

  it('fails the export if an asset is missing instead of recording an incomplete baseline', async () => {
    repository.find.mockResolvedValue([
      { path: 'public-asset/public/logo.png' },
    ]);
    storage.readFile.mockRejectedValue(new Error('Missing asset'));
    await expect(
      service.exportPublicAssets({
        workspaceId,
        applicationId,
        applicationUniversalIdentifier,
      }),
    ).rejects.toThrow('Missing asset');
  });
});
