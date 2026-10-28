import { readFile } from 'fs/promises';
import { join } from 'path';

import { ASSET_PATH } from 'src/constants/assets-path';
import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { RefreshWorkspaceDefaultDependenciesCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793182799028-refresh-workspace-default-dependencies.command';
import { type ApplicationDependencyFilesService } from 'src/engine/core-modules/application/application-package/application-dependency-files.service';
import { computeApplicationPackageChecksums } from 'src/engine/core-modules/application/application-package/utils/compute-application-package-checksums.util';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const WORKSPACE_CUSTOM_APPLICATION = {
  id: '20202020-0000-0000-0000-000000000003',
  universalIdentifier: '20202020-0000-0000-0000-000000000003',
};
const DEFAULT_DEPENDENCY_CHECKSUMS_IN_2_52 = {
  packageJsonChecksum: '444fb064df1febd5f30c8bcadf58e536',
  yarnLockChecksum: '225201a4fd2b60ab92c865fce0fd18d6',
};

const computeSnapshotChecksums = async () => {
  const directory = join(
    ASSET_PATH,
    'database/commands/upgrade-version-command/2-52/workspace-frontend-dependencies',
  );
  const [packageJsonContent, yarnLockContent] = await Promise.all([
    readFile(join(directory, 'package.snapshot.json'), 'utf8'),
    readFile(join(directory, 'yarn.snapshot.lock'), 'utf8'),
  ]);

  return computeApplicationPackageChecksums({
    packageJsonContent,
    yarnLockContent,
  });
};

const runCommand = async ({
  storedChecksums,
  dryRun = false,
}: {
  storedChecksums: {
    packageJsonChecksum: string;
    yarnLockChecksum: string | null;
  };
  dryRun?: boolean;
}) => {
  const uploadDefaultPackageFilesAndSetFileIds = jest.fn();

  const command = new RefreshWorkspaceDefaultDependenciesCommand(
    {} as WorkspaceIteratorService,
    {
      findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
        .fn()
        .mockResolvedValue({
          workspaceCustomFlatApplication: WORKSPACE_CUSTOM_APPLICATION,
        }),
      uploadDefaultPackageFilesAndSetFileIds,
    } as unknown as ApplicationService,
    {
      getDependencyContents: jest
        .fn()
        .mockResolvedValue({ storedFilesChecksums: storedChecksums }),
    } as unknown as ApplicationDependencyFilesService,
  );

  await command.runOnWorkspace({
    workspaceId: WORKSPACE_ID,
    options: { dryRun },
  } as Parameters<typeof command.runOnWorkspace>[0]);

  return { uploadDefaultPackageFilesAndSetFileIds };
};

describe('RefreshWorkspaceDefaultDependenciesCommand', () => {
  it('moves a Workspace app still on the 2.52 snapshot to the default dependencies', async () => {
    const { uploadDefaultPackageFilesAndSetFileIds } = await runCommand({
      storedChecksums: await computeSnapshotChecksums(),
    });

    expect(uploadDefaultPackageFilesAndSetFileIds).toHaveBeenCalledTimes(1);
    expect(uploadDefaultPackageFilesAndSetFileIds).toHaveBeenCalledWith({
      ...WORKSPACE_CUSTOM_APPLICATION,
      workspaceId: WORKSPACE_ID,
    });
  });

  it('moves a Workspace app still on the 2.52 default dependencies', async () => {
    const { uploadDefaultPackageFilesAndSetFileIds } = await runCommand({
      storedChecksums: DEFAULT_DEPENDENCY_CHECKSUMS_IN_2_52,
    });

    expect(uploadDefaultPackageFilesAndSetFileIds).toHaveBeenCalledTimes(1);
  });

  it('leaves a Workspace app whose dependencies changed since', async () => {
    const { uploadDefaultPackageFilesAndSetFileIds } = await runCommand({
      storedChecksums: {
        ...(await computeSnapshotChecksums()),
        yarnLockChecksum: 'fedcba9876543210fedcba9876543210',
      },
    });

    expect(uploadDefaultPackageFilesAndSetFileIds).not.toHaveBeenCalled();
  });

  it('changes nothing in a dry run', async () => {
    const { uploadDefaultPackageFilesAndSetFileIds } = await runCommand({
      storedChecksums: await computeSnapshotChecksums(),
      dryRun: true,
    });

    expect(uploadDefaultPackageFilesAndSetFileIds).not.toHaveBeenCalled();
  });
});
