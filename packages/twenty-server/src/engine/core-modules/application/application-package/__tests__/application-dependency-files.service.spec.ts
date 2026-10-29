import { Readable } from 'node:stream';
import { Test } from '@nestjs/testing';

import { FileFolder } from 'twenty-shared/types';

import { ApplicationDependencyFilesService } from 'src/engine/core-modules/application/application-package/application-dependency-files.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';

const identifier = {
  workspaceId: 'workspace',
  applicationUniversalIdentifier: 'custom-application',
};
const packageJsonContent =
  '{"name":"app","dependencies":{"lodash":"4.17.21"}}\n';

jest.mock(
  'src/engine/core-modules/file-storage/services/file-storage.service',
  () => ({
    FileStorageService: jest.fn(),
  }),
);

describe('ApplicationDependencyFilesService export', () => {
  let service: ApplicationDependencyFilesService;
  let storedFiles: Map<string, string>;
  const fileStorageService = {
    checkFileExists: jest.fn(),
    readFile: jest.fn(),
  };

  beforeEach(async () => {
    storedFiles = new Map([
      ['dependencies/package.json', packageJsonContent],
      ['dependencies/yarn.lock', 'exact-lock\n'],
      ['source/package.json', 'source file'],
      ['public-asset/logo.png', 'image'],
      ['files-field/attachment.png', 'private record attachment'],
      ['email-attachment/invoice.pdf', 'private invoice'],
    ]);
    fileStorageService.checkFileExists.mockImplementation(
      async ({ fileFolder, resourcePath }) =>
        storedFiles.has(`${fileFolder}/${resourcePath}`),
    );
    fileStorageService.readFile.mockImplementation(
      async ({ fileFolder, resourcePath }) =>
        Readable.from([
          Buffer.from(storedFiles.get(`${fileFolder}/${resourcePath}`) ?? ''),
        ]),
    );
    const module = await Test.createTestingModule({
      providers: [
        ApplicationDependencyFilesService,
        { provide: FileStorageService, useValue: fileStorageService },
      ],
    }).compile();
    service = module.get(ApplicationDependencyFilesService);
  });

  it('exports only the selected application dependency files and preserves their bytes', async () => {
    expect(await service.getExportedDependencyFiles(identifier)).toEqual([
      {
        folder: 'dependencies',
        path: 'package.json',
        content: packageJsonContent,
      },
      { folder: 'dependencies', path: 'yarn.lock', content: 'exact-lock\n' },
    ]);
    expect(fileStorageService.readFile).toHaveBeenCalledTimes(2);
    for (const [request] of fileStorageService.readFile.mock.calls) {
      expect(request).toEqual({
        ...identifier,
        fileFolder: FileFolder.Dependencies,
        resourcePath: expect.stringMatching(/^(package\.json|yarn\.lock)$/),
      });
    }
  });

  it('allows an application without a stored lockfile', async () => {
    storedFiles.delete('dependencies/yarn.lock');
    expect(await service.getExportedDependencyFiles(identifier)).toEqual([
      {
        folder: 'dependencies',
        path: 'package.json',
        content: packageJsonContent,
      },
    ]);
  });

  it('leaves metadata export available for applications without stored dependencies', async () => {
    storedFiles.delete('dependencies/package.json');
    expect(await service.getExportedDependencyFiles(identifier)).toEqual([]);
    expect(fileStorageService.readFile).not.toHaveBeenCalled();
  });

  it('fails export when an existing dependency cannot be read', async () => {
    fileStorageService.readFile.mockRejectedValueOnce(
      new Error('storage unavailable'),
    );
    await expect(
      service.getExportedDependencyFiles(identifier),
    ).rejects.toThrow('storage unavailable');
  });
});
