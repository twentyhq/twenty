import { execFileSync } from 'child_process';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { isString } from '@sniptt/guards';

import { TWENTY_PREVIOUS_VERSIONS } from '../src/engine/core-modules/upgrade/constants/twenty-previous-versions.constant';
import { generateWorkspaceCustomApplicationDependencies } from './generate-workspace-custom-application-dependencies';

jest.mock('child_process', () => ({ execFileSync: jest.fn() }));

const originalPackageJson = {
  name: 'workspace-custom-app',
  dependencies: { axios: '^1.15.0', 'removed-package': '1.0.0' },
  devDependencies: { react: '19.2.0', 'twenty-ui': '2.50.0' },
  frontComponentSharedDependencies: ['react', 'twenty-ui/theme'],
};

const seedPackageJson = {
  dependencies: { axios: '^1.16.1', uuid: '^11.1.1' },
};

const originalLock = 'original lock';

const readPackageJson = (directory: string) =>
  JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8'));

const readLock = (directory: string) =>
  readFileSync(join(directory, 'yarn.lock'), 'utf8');

describe('generateWorkspaceCustomApplicationDependencies', () => {
  let dependenciesDirectory: string;
  let seedDependenciesDirectory: string;
  let installDirectory: string;

  beforeEach(() => {
    dependenciesDirectory = mkdtempSync(
      join(tmpdir(), 'workspace-defaults-test-'),
    );
    seedDependenciesDirectory = mkdtempSync(
      join(tmpdir(), 'seed-defaults-test-'),
    );
    writeFileSync(
      join(seedDependenciesDirectory, 'package.json'),
      JSON.stringify(seedPackageJson),
    );
    writeFileSync(
      join(dependenciesDirectory, 'package.json'),
      JSON.stringify(originalPackageJson),
    );
    writeFileSync(join(dependenciesDirectory, 'yarn.lock'), originalLock);
    jest.mocked(execFileSync).mockImplementation((_file, _args, options) => {
      if (!isString(options?.cwd)) {
        throw new Error('Missing install directory');
      }

      installDirectory = options.cwd;
      expect(readPackageJson(dependenciesDirectory)).toEqual(
        originalPackageJson,
      );
      expect(readLock(installDirectory)).toBe(originalLock);
      expect(readPackageJson(installDirectory).dependencies).toEqual(
        seedPackageJson.dependencies,
      );

      const version =
        readPackageJson(installDirectory).devDependencies['twenty-ui'];

      writeFileSync(join(installDirectory, 'yarn.lock'), `resolved ${version}`);

      return Buffer.from('');
    });
  });

  afterEach(() => {
    rmSync(dependenciesDirectory, { recursive: true, force: true });
    rmSync(seedDependenciesDirectory, { recursive: true, force: true });
    jest.resetAllMocks();
  });

  it.each([
    {
      version: undefined,
      expectedRange: `~${TWENTY_PREVIOUS_VERSIONS[TWENTY_PREVIOUS_VERSIONS.length - 1]}`,
    },
    { version: '3.14.7', expectedRange: '~3.14.0' },
  ])(
    'writes a matching pair for $expectedRange using the seed backend dependencies',
    ({ version, expectedRange }) => {
      generateWorkspaceCustomApplicationDependencies({
        version,
        dependenciesDirectory,
        seedDependenciesDirectory,
      });

      expect(readPackageJson(dependenciesDirectory)).toEqual({
        ...originalPackageJson,
        dependencies: seedPackageJson.dependencies,
        devDependencies: {
          ...originalPackageJson.devDependencies,
          'twenty-ui': expectedRange,
        },
      });
      expect(readLock(dependenciesDirectory)).toBe(`resolved ${expectedRange}`);
      expect(existsSync(installDirectory)).toBe(false);
    },
  );

  it('preserves both shipped files and cleans up when Yarn cannot resolve the release', () => {
    jest.mocked(execFileSync).mockImplementation((_file, _args, options) => {
      if (!isString(options?.cwd)) {
        throw new Error('Missing install directory');
      }

      installDirectory = options.cwd;
      throw new Error('No published version');
    });

    expect(() =>
      generateWorkspaceCustomApplicationDependencies({
        dependenciesDirectory,
        seedDependenciesDirectory,
      }),
    ).toThrow('No published version');
    expect(
      readFileSync(join(dependenciesDirectory, 'package.json'), 'utf8'),
    ).toBe(JSON.stringify(originalPackageJson));
    expect(readLock(dependenciesDirectory)).toBe(originalLock);
    expect(existsSync(installDirectory)).toBe(false);
  });
});
