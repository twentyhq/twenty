import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { type Response } from 'express';

import { SdkClientController } from 'src/engine/core-modules/sdk-client/controllers/sdk-client.controller';
import { SdkClientArchiveService } from 'src/engine/core-modules/sdk-client/sdk-client-archive.service';
import { getInstalledSdkMetadataModule } from 'src/engine/core-modules/sdk-client/utils/get-installed-sdk-metadata-module.util';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

jest.mock(
  'src/engine/core-modules/sdk-client/utils/get-installed-sdk-metadata-module.util',
  () => ({
    getInstalledSdkMetadataModule: jest.fn(),
  }),
);

const mockGetInstalledSdkMetadataModule = jest.mocked(
  getInstalledSdkMetadataModule,
);

const WORKSPACE_ID = 'workspace-1';
const APPLICATION_ID = 'app-1';

const workspace = { id: WORKSPACE_ID } as WorkspaceEntity;

describe('SdkClientController', () => {
  let controller: SdkClientController;
  let workspaceCacheService: jest.Mocked<
    Pick<WorkspaceCacheService, 'getOrRecompute'>
  >;
  let sdkClientArchiveService: jest.Mocked<
    Pick<SdkClientArchiveService, 'getClientModuleFromArchive'>
  >;
  let response: jest.Mocked<Pick<Response, 'setHeader' | 'send'>>;

  beforeEach(async () => {
    jest.clearAllMocks();

    workspaceCacheService = {
      getOrRecompute: jest.fn().mockResolvedValue({
        flatApplicationMaps: {
          byId: {
            [APPLICATION_ID]: {
              id: APPLICATION_ID,
              universalIdentifier: 'my-app',
            },
          },
        },
      }),
    };
    sdkClientArchiveService = {
      getClientModuleFromArchive: jest
        .fn()
        .mockResolvedValue(Buffer.from('core module from archive')),
    };
    response = {
      setHeader: jest.fn(),
      send: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SdkClientController],
      providers: [
        { provide: WorkspaceCacheService, useValue: workspaceCacheService },
        {
          provide: SdkClientArchiveService,
          useValue: sdkClientArchiveService,
        },
      ],
    }).compile();

    controller = module.get<SdkClientController>(SdkClientController);
  });

  it('serves the metadata module from the installed package, not the archive', async () => {
    const installedModuleBuffer = Buffer.from('installed metadata module');

    mockGetInstalledSdkMetadataModule.mockResolvedValue({
      moduleBuffer: installedModuleBuffer,
      checksum: 'a'.repeat(64),
    });

    await controller.getSdkModule(
      response as unknown as Response,
      APPLICATION_ID,
      'metadata',
      workspace,
    );

    expect(
      sdkClientArchiveService.getClientModuleFromArchive,
    ).not.toHaveBeenCalled();
    expect(response.send).toHaveBeenCalledWith(installedModuleBuffer);
  });

  it('serves the core module from the application archive', async () => {
    await controller.getSdkModule(
      response as unknown as Response,
      APPLICATION_ID,
      'core',
      workspace,
    );

    expect(
      sdkClientArchiveService.getClientModuleFromArchive,
    ).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      applicationId: APPLICATION_ID,
      applicationUniversalIdentifier: 'my-app',
      moduleName: 'core',
    });
    expect(mockGetInstalledSdkMetadataModule).not.toHaveBeenCalled();
  });

  it('rejects unknown module names', async () => {
    await expect(
      controller.getSdkModule(
        response as unknown as Response,
        APPLICATION_ID,
        'evil' as never,
        workspace,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects unknown applications', async () => {
    await expect(
      controller.getSdkModule(
        response as unknown as Response,
        'unknown-app',
        'metadata',
        workspace,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
