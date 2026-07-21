import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { type Response } from 'express';

import {
  SDK_CLIENT_MODULE_CACHE_CONTROL,
  SDK_CLIENT_MODULE_NO_STORE_CACHE_CONTROL,
} from 'src/engine/core-modules/sdk-client/constants/sdk-client-module-cache-control';
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

const CORE_MODULE_BUFFER = Buffer.from('core module from archive');
const PERSISTED_CORE_CHECKSUM = 'b'.repeat(64);

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
              sdkClientCoreChecksum: PERSISTED_CORE_CHECKSUM,
            },
          },
        },
      }),
    };
    sdkClientArchiveService = {
      getClientModuleFromArchive: jest
        .fn()
        .mockResolvedValue(CORE_MODULE_BUFFER),
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

  describe('instance-wide metadata route', () => {
    const INSTALLED_METADATA_BUFFER = Buffer.from('installed metadata module');
    const INSTALLED_METADATA_CHECKSUM = 'a'.repeat(64);

    beforeEach(() => {
      mockGetInstalledSdkMetadataModule.mockResolvedValue({
        moduleBuffer: INSTALLED_METADATA_BUFFER,
        checksum: INSTALLED_METADATA_CHECKSUM,
      });
    });

    it('serves the installed metadata module without touching workspace caches', async () => {
      await controller.getInstanceSdkMetadataModule(
        response as unknown as Response,
      );

      expect(workspaceCacheService.getOrRecompute).not.toHaveBeenCalled();
      expect(
        sdkClientArchiveService.getClientModuleFromArchive,
      ).not.toHaveBeenCalled();
      expect(response.send).toHaveBeenCalledWith(INSTALLED_METADATA_BUFFER);
    });

    it('opts out of caching on the bare url', async () => {
      await controller.getInstanceSdkMetadataModule(
        response as unknown as Response,
      );

      expect(response.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        SDK_CLIENT_MODULE_NO_STORE_CACHE_CONTROL,
      );
    });

    it('serves fingerprinted urls as immutable when the checksum matches the installed module', async () => {
      await controller.getInstanceSdkMetadataModule(
        response as unknown as Response,
        INSTALLED_METADATA_CHECKSUM,
      );

      expect(response.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        SDK_CLIENT_MODULE_CACHE_CONTROL,
      );
    });

    it('opts out of caching when the fingerprint does not match the installed module', async () => {
      await controller.getInstanceSdkMetadataModule(
        response as unknown as Response,
        'c'.repeat(64),
      );

      expect(response.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        SDK_CLIENT_MODULE_NO_STORE_CACHE_CONTROL,
      );
    });
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

  it('disables MIME sniffing and opts out of HTTP caching on the bare fallback url', async () => {
    await controller.getSdkModule(
      response as unknown as Response,
      APPLICATION_ID,
      'core',
      workspace,
    );

    expect(response.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/javascript',
    );
    expect(response.setHeader).toHaveBeenCalledWith(
      'X-Content-Type-Options',
      'nosniff',
    );
    expect(response.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      SDK_CLIENT_MODULE_NO_STORE_CACHE_CONTROL,
    );
  });

  it('serves fingerprinted urls as immutable when the checksum matches the persisted core checksum', async () => {
    await controller.getSdkModule(
      response as unknown as Response,
      APPLICATION_ID,
      'core',
      workspace,
      PERSISTED_CORE_CHECKSUM,
    );

    expect(response.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      SDK_CLIENT_MODULE_CACHE_CONTROL,
    );
  });

  it('opts out of caching when the fingerprint does not match the persisted checksum', async () => {
    await controller.getSdkModule(
      response as unknown as Response,
      APPLICATION_ID,
      'core',
      workspace,
      'a'.repeat(64),
    );

    expect(response.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      SDK_CLIENT_MODULE_NO_STORE_CACHE_CONTROL,
    );
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
