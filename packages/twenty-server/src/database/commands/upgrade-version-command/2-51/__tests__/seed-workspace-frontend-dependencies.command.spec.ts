import { Test } from '@nestjs/testing';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { Readable } from 'stream';
import { SeedWorkspaceFrontendDependenciesCommand } from 'src/database/commands/upgrade-version-command/2-51/2-51-workspace-command-1792743722572-seed-workspace-frontend-dependencies.command';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { logicFunctionCreateHash } from 'src/engine/metadata-modules/logic-function/utils/logic-function-create-hash.utils';

describe('SeedWorkspaceFrontendDependenciesCommand', () => {
  const findApplication = jest.fn();
  const update = jest.fn();
  const writeFile = jest.fn();
  const readStoredFile = jest.fn();
  const args = { workspaceId: 'workspace', options: {}, index: 0, total: 1 };
  let command: SeedWorkspaceFrontendDependenciesCommand;
  let before: { packageJson: string; yarnLock: string };
  let after: typeof before;
  const applicationWith = (files: typeof before) => ({
    workspaceCustomFlatApplication: {
      id: 'custom-app',
      universalIdentifier: 'custom-app-universal',
      packageJsonChecksum: logicFunctionCreateHash(
        JSON.stringify(JSON.parse(files.packageJson)),
      ),
      yarnLockChecksum: logicFunctionCreateHash(files.yarnLock),
    },
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    [before, after] = await Promise.all(
      ['before', 'after'].map(async (state) => {
        const directory = join(
          __dirname,
          '../workspace-frontend-dependencies',
          state,
        );
        return {
          packageJson: await readFile(
            join(directory, 'package.snapshot.json'),
            'utf8',
          ),
          yarnLock: await readFile(
            join(directory, 'yarn.snapshot.lock'),
            'utf8',
          ),
        };
      }),
    );
    findApplication.mockResolvedValue(applicationWith(before));
    readStoredFile.mockImplementation(
      async ({ resourcePath }: { resourcePath: string }) =>
        Readable.from(
          resourcePath === 'package.json'
            ? before.packageJson
            : before.yarnLock,
        ),
    );
    writeFile.mockImplementation(
      async ({ resourcePath }: { resourcePath: string }) => ({
        id: resourcePath,
      }),
    );
    const module = await Test.createTestingModule({
      providers: [
        SeedWorkspaceFrontendDependenciesCommand,
        { provide: WorkspaceIteratorService, useValue: {} },
        {
          provide: ApplicationService,
          useValue: {
            findWorkspaceTwentyStandardAndCustomApplicationOrThrow:
              findApplication,
            update,
          },
        },
        {
          provide: FileStorageService,
          useValue: { readFile: readStoredFile, writeFile },
        },
      ],
    }).compile();
    command = module.get(SeedWorkspaceFrontendDependenciesCommand);
  });

  it('adds frontend defaults without changing existing production dependency declarations', async () => {
    expect(JSON.parse(after.packageJson).dependencies).toEqual(
      JSON.parse(before.packageJson).dependencies,
    );
    await command.up(args);
    expect(writeFile).toHaveBeenCalledWith(
      expect.objectContaining({
        applicationId: 'custom-app',
        resourcePath: 'package.json',
        sourceFile: after.packageJson,
      }),
    );
    expect(writeFile).toHaveBeenCalledWith(
      expect.objectContaining({
        resourcePath: 'yarn.lock',
        sourceFile: after.yarnLock,
      }),
    );
    expect(update).toHaveBeenCalledWith(
      'custom-app',
      expect.objectContaining({
        packageJsonChecksum:
          applicationWith(after).workspaceCustomFlatApplication
            .packageJsonChecksum,
      }),
    );
  });
  it('preserves customized package files even when their lock is still the default', async () => {
    findApplication.mockResolvedValue(
      applicationWith({
        ...before,
        packageJson: JSON.stringify({ dependencies: { react: '18.3.1' } }),
      }),
    );
    await command.up(args);
    expect(writeFile).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });
  it('is idempotent after upgrading', async () => {
    findApplication.mockResolvedValue(applicationWith(after));
    await command.up(args);
    expect(writeFile).not.toHaveBeenCalled();
  });
  it('restores the original pair on rollback', async () => {
    findApplication.mockResolvedValue(applicationWith(after));
    readStoredFile.mockImplementation(
      async ({ resourcePath }: { resourcePath: string }) =>
        Readable.from(
          resourcePath === 'package.json' ? after.packageJson : after.yarnLock,
        ),
    );
    await command.down(args);
    expect(writeFile).toHaveBeenCalledWith(
      expect.objectContaining({
        resourcePath: 'yarn.lock',
        sourceFile: before.yarnLock,
      }),
    );
  });
  it('does not write during a dry run', async () => {
    await command.up({ ...args, options: { dryRun: true } });
    expect(writeFile).not.toHaveBeenCalled();
  });
  it('does not overwrite files changed outside their recorded metadata', async () => {
    readStoredFile.mockResolvedValue(Readable.from('changed'));
    await expect(command.up(args)).rejects.toThrow(
      'files changed during upgrade',
    );
    expect(writeFile).not.toHaveBeenCalled();
  });
});
