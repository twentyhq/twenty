import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'path';

import { afterEach, describe, expect, it } from 'vitest';

import { extractFrontComponentSharedDependencies } from '@/cli/utilities/build/manifest/utils/extract-front-component-shared-dependencies';
import { FRONT_COMPONENT_SHARED_DEPENDENCIES_BUILT_PATH } from 'twenty-shared/application';

const scratchDirs: string[] = [];

const writeAppPackageJson = async (packageJson: unknown): Promise<string> => {
  const appPath = await mkdtemp(join(tmpdir(), 'shared-dependencies-extract-'));

  scratchDirs.push(appPath);
  await writeFile(
    join(appPath, 'package.json'),
    JSON.stringify(packageJson),
    'utf-8',
  );

  return appPath;
};

describe('extractFrontComponentSharedDependencies', () => {
  afterEach(async () => {
    await Promise.all(
      scratchDirs
        .splice(0)
        .map((dir) => rm(dir, { recursive: true, force: true })),
    );
  });

  it('extracts and normalizes the declared dependencies', async () => {
    const appPath = await writeAppPackageJson({
      frontComponentSharedDependencies: ['react', 'react-dom/client'],
    });

    const { sharedDependencies, errors } =
      await extractFrontComponentSharedDependencies(appPath);

    expect(errors).toEqual([]);
    expect(sharedDependencies).toEqual({
      dependencies: ['react', 'react-dom/client', 'react/jsx-runtime'],
      builtPath: FRONT_COMPONENT_SHARED_DEPENDENCIES_BUILT_PATH,
      builtChecksum: null,
    });
  });

  it.each([
    ['an absent key', {}],
    ['an empty array', { frontComponentSharedDependencies: [] }],
  ])(
    'returns no bundle and no error for %s',
    async (_label, packageJson) => {
      const appPath = await writeAppPackageJson(packageJson);

      const { sharedDependencies, errors } =
        await extractFrontComponentSharedDependencies(appPath);

      expect(errors).toEqual([]);
      expect(sharedDependencies).toBeUndefined();
    },
  );

  it('returns no bundle and no error when package.json is missing', async () => {
    const appPath = await mkdtemp(join(tmpdir(), 'shared-dependencies-none-'));

    scratchDirs.push(appPath);

    const { sharedDependencies, errors } =
      await extractFrontComponentSharedDependencies(appPath);

    expect(errors).toEqual([]);
    expect(sharedDependencies).toBeUndefined();
  });

  it('rejects a non-array value', async () => {
    const appPath = await writeAppPackageJson({
      frontComponentSharedDependencies: { react: '^19' },
    });

    const { sharedDependencies, errors } =
      await extractFrontComponentSharedDependencies(appPath);

    expect(sharedDependencies).toBeUndefined();
    expect(errors[0]).toContain('must be an array of package specifiers');
  });

  it('rejects relative and absolute paths', async () => {
    const appPath = await writeAppPackageJson({
      frontComponentSharedDependencies: ['./local-module'],
    });

    const { errors } = await extractFrontComponentSharedDependencies(appPath);

    expect(errors[0]).toContain(
      'must be a package specifier, not a relative or absolute path',
    );
  });

  it.each([
    'twenty-client-sdk',
    'twenty-client-sdk/core',
    'twenty-sdk',
    'twenty-sdk/define',
  ])('rejects the reserved dependency "%s"', async (dependency) => {
    const appPath = await writeAppPackageJson({
      frontComponentSharedDependencies: [dependency],
    });

    const { errors } = await extractFrontComponentSharedDependencies(appPath);

    expect(errors[0]).toContain(
      'is already served separately and cannot be shared',
    );
  });

  it('rejects a duplicated dependency', async () => {
    const appPath = await writeAppPackageJson({
      frontComponentSharedDependencies: ['react', 'react'],
    });

    const { errors } = await extractFrontComponentSharedDependencies(appPath);

    expect(errors[0]).toContain('is declared twice');
  });

  it('rejects non-string entries', async () => {
    const appPath = await writeAppPackageJson({
      frontComponentSharedDependencies: ['react', 42],
    });

    const { errors } = await extractFrontComponentSharedDependencies(appPath);

    expect(errors[0]).toContain('must be non-empty strings');
  });
});
