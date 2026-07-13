import { Test, type TestingModule } from '@nestjs/testing';

import { type Manifest } from 'twenty-shared/application';
import { ServerFileFolder } from 'twenty-shared/types';

import { ApplicationPackageFileService } from 'src/engine/core-modules/application/application-package/application-package-file.service';
import { ApplicationException } from 'src/engine/core-modules/application/application.exception';
import { FileStorageException } from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { ServerFileStorageService } from 'src/engine/core-modules/file-storage/services/server-file-storage.service';

const APPLICATION_REGISTRATION_ID = '20202020-0000-4000-8000-000000000001';

const ONE_PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

const PACKAGE_FILE_CONTENTS: Record<string, Buffer> = {
  'package.json': Buffer.from('{"name":"my-app","version":"1.2.3"}'),
  'dist/index.mjs': Buffer.from('export const handler = () => {};'),
  'dist/component.mjs': Buffer.from('export const Component = () => null;'),
  'public/hero.png': ONE_PIXEL_PNG,
};

const buildManifest = (overrides: Partial<Manifest> = {}): Manifest =>
  ({
    application: { universalIdentifier: 'my-app' },
    logicFunctions: [{ builtHandlerPath: 'dist/index.mjs' }],
    frontComponents: [{ builtComponentPath: 'dist/component.mjs' }],
    publicAssets: [{ filePath: 'public/hero.png' }],
    ...overrides,
  }) as Manifest;

describe('ApplicationPackageFileService', () => {
  let service: ApplicationPackageFileService;
  let serverFileStorageService: jest.Mocked<
    Pick<
      ServerFileStorageService,
      'listStoredResourcePaths' | 'writeServerFile'
    >
  >;
  let readPackageFile: jest.Mock;

  beforeEach(async () => {
    serverFileStorageService = {
      listStoredResourcePaths: jest.fn().mockResolvedValue([]),
      writeServerFile: jest.fn().mockResolvedValue({ id: 'file-id' }),
    };

    readPackageFile = jest
      .fn()
      .mockImplementation((relativePath: string) =>
        Promise.resolve(PACKAGE_FILE_CONTENTS[relativePath]),
      );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationPackageFileService,
        {
          provide: ServerFileStorageService,
          useValue: serverFileStorageService,
        },
      ],
    }).compile();

    service = module.get(ApplicationPackageFileService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should store every package file under a version-prefixed server path', async () => {
    await service.ensurePackageFilesStored({
      applicationRegistrationId: APPLICATION_REGISTRATION_ID,
      version: '1.2.3',
      manifest: buildManifest(),
      readPackageFile,
    });

    const writtenResourcePaths =
      serverFileStorageService.writeServerFile.mock.calls.map(
        ([params]) => params.resourcePath,
      );

    expect(writtenResourcePaths).toEqual([
      '1.2.3/dependencies/package.json',
      '1.2.3/built-logic-function/dist/index.mjs',
      '1.2.3/built-front-component/dist/component.mjs',
      '1.2.3/public-asset/public/hero.png',
    ]);

    for (const [params] of serverFileStorageService.writeServerFile.mock
      .calls) {
      expect(params.fileFolder).toBe(ServerFileFolder.ApplicationPackage);
      expect(params.applicationRegistrationId).toBe(
        APPLICATION_REGISTRATION_ID,
      );
    }
  });

  it('should skip files already stored for the same version', async () => {
    serverFileStorageService.listStoredResourcePaths.mockResolvedValue([
      '1.2.3/dependencies/package.json',
      '1.2.3/built-logic-function/dist/index.mjs',
      '1.2.3/built-front-component/dist/component.mjs',
      '1.2.3/public-asset/public/hero.png',
    ]);

    await service.ensurePackageFilesStored({
      applicationRegistrationId: APPLICATION_REGISTRATION_ID,
      version: '1.2.3',
      manifest: buildManifest(),
      readPackageFile,
    });

    expect(readPackageFile).not.toHaveBeenCalled();
    expect(serverFileStorageService.writeServerFile).not.toHaveBeenCalled();
  });

  it('should store files of a new version even when a previous version is stored', async () => {
    serverFileStorageService.listStoredResourcePaths.mockResolvedValue([
      '1.2.3/dependencies/package.json',
      '1.2.3/built-logic-function/dist/index.mjs',
    ]);

    await service.ensurePackageFilesStored({
      applicationRegistrationId: APPLICATION_REGISTRATION_ID,
      version: '2.0.0',
      manifest: buildManifest(),
      readPackageFile,
    });

    const writtenResourcePaths =
      serverFileStorageService.writeServerFile.mock.calls.map(
        ([params]) => params.resourcePath,
      );

    expect(writtenResourcePaths).toContain(
      '2.0.0/built-logic-function/dist/index.mjs',
    );
  });

  it('should strip semver build metadata from the version path segment', async () => {
    await service.ensurePackageFilesStored({
      applicationRegistrationId: APPLICATION_REGISTRATION_ID,
      version: '1.2.3+build.5',
      manifest: buildManifest(),
      readPackageFile,
    });

    const writtenResourcePaths =
      serverFileStorageService.writeServerFile.mock.calls.map(
        ([params]) => params.resourcePath,
      );

    expect(writtenResourcePaths).toContain('1.2.3/dependencies/package.json');
  });

  it('should reject a version that is not valid semver', async () => {
    await expect(
      service.ensurePackageFilesStored({
        applicationRegistrationId: APPLICATION_REGISTRATION_ID,
        version: '../escape',
        manifest: buildManifest(),
        readPackageFile,
      }),
    ).rejects.toThrow(ApplicationException);

    expect(readPackageFile).not.toHaveBeenCalled();
    expect(serverFileStorageService.writeServerFile).not.toHaveBeenCalled();
  });

  it('should reject a file whose extension is not allowed for its folder', async () => {
    await expect(
      service.ensurePackageFilesStored({
        applicationRegistrationId: APPLICATION_REGISTRATION_ID,
        version: '1.2.3',
        manifest: buildManifest({
          logicFunctions: [
            { builtHandlerPath: 'dist/index.js' },
          ] as Manifest['logicFunctions'],
        }),
        readPackageFile,
      }),
    ).rejects.toThrow(FileStorageException);

    expect(serverFileStorageService.writeServerFile).not.toHaveBeenCalled();
  });
});
