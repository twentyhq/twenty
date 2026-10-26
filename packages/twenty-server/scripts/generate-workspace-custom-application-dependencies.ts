import { execFileSync } from 'child_process';
import {
  copyFileSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';

import { isNonEmptyString } from '@sniptt/guards';
import semver from 'semver';

import { TWENTY_PREVIOUS_VERSIONS } from '../src/engine/core-modules/upgrade/constants/twenty-previous-versions.constant';

const APPLICATION_PACKAGE_CONSTANTS_DIRECTORY = resolve(
  __dirname,
  '../src/engine/core-modules/application/application-package/constants',
);

export const generateWorkspaceCustomApplicationDependencies = ({
  version = TWENTY_PREVIOUS_VERSIONS[TWENTY_PREVIOUS_VERSIONS.length - 1],
  dependenciesDirectory = join(
    APPLICATION_PACKAGE_CONSTANTS_DIRECTORY,
    'workspace-custom-application-dependencies',
  ),
  seedDependenciesDirectory = join(
    APPLICATION_PACKAGE_CONSTANTS_DIRECTORY,
    'seed-dependencies',
  ),
}: {
  version?: string;
  dependenciesDirectory?: string;
  seedDependenciesDirectory?: string;
} = {}): void => {
  const packageJsonPath = join(dependenciesDirectory, 'package.json');
  const yarnLockPath = join(dependenciesDirectory, 'yarn.lock');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  const seedPackageJson = JSON.parse(
    readFileSync(join(seedDependenciesDirectory, 'package.json'), 'utf8'),
  );

  packageJson.dependencies = seedPackageJson.dependencies;

  // twenty-ui is published after deployment, so defaults use the previous release.
  packageJson.devDependencies['twenty-ui'] =
    `~${semver.major(version)}.${semver.minor(version)}.0`;

  const packageJsonContent = `${JSON.stringify(packageJson, null, 2)}\n`;
  const yarnEngineDirectory = join(
    APPLICATION_PACKAGE_CONSTANTS_DIRECTORY,
    'yarn-engine',
  );
  const yarnConfigurationPath = join(yarnEngineDirectory, '.yarnrc.yml');
  const yarnConfiguration = readFileSync(yarnConfigurationPath, 'utf8');
  const yarnPath = /^yarnPath:\s*(.+)$/m.exec(yarnConfiguration)?.[1]?.trim();

  if (!isNonEmptyString(yarnPath)) {
    throw new Error('The application Yarn configuration has no yarnPath');
  }

  const workingDirectory = mkdtempSync(
    join(tmpdir(), 'twenty-workspace-dependencies-'),
  );

  try {
    writeFileSync(join(workingDirectory, 'package.json'), packageJsonContent);
    copyFileSync(yarnLockPath, join(workingDirectory, 'yarn.lock'));
    copyFileSync(yarnConfigurationPath, join(workingDirectory, '.yarnrc.yml'));

    const environment = Object.fromEntries(
      Object.entries(process.env).filter(
        ([name]) => !name.startsWith('YARN_') && name !== 'NODE_OPTIONS',
      ),
    );

    execFileSync(
      process.execPath,
      [
        join(yarnEngineDirectory, yarnPath),
        'install',
        '--mode=update-lockfile',
      ],
      {
        cwd: workingDirectory,
        env: {
          ...environment,
          YARN_IGNORE_PATH: 'true',
          YARN_ENABLE_IMMUTABLE_INSTALLS: 'false',
          YARN_ENABLE_TELEMETRY: 'false',
        },
        stdio: 'inherit',
      },
    );

    const yarnLockContent = readFileSync(
      join(workingDirectory, 'yarn.lock'),
      'utf8',
    );

    writeFileSync(packageJsonPath, packageJsonContent);
    writeFileSync(yarnLockPath, yarnLockContent);
  } finally {
    rmSync(workingDirectory, { recursive: true, force: true });
  }
};

if (require.main === module) {
  generateWorkspaceCustomApplicationDependencies();
}
