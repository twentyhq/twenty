import { validatePackageJsonDependencies } from '@/cli/utilities/build/manifest/utils/validate-package-json-dependencies';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const writeTempPackageJson = async (
  packageJson: Record<string, unknown> | null,
): Promise<string> => {
  const appPath = await mkdtemp(join(tmpdir(), 'twenty-sdk-deps-'));

  if (packageJson !== null) {
    await writeFile(
      join(appPath, 'package.json'),
      JSON.stringify(packageJson, null, 2),
    );
  }

  return appPath;
};

describe('validatePackageJsonDependencies', () => {
  let appPath: string;

  afterEach(async () => {
    if (appPath) {
      await rm(appPath, { recursive: true, force: true });
    }
  });

  it('should warn when twenty-sdk is listed under dependencies', async () => {
    appPath = await writeTempPackageJson({
      dependencies: { 'twenty-sdk': '^2.8.0', 'twenty-client-sdk': '^2.8.0' },
    });

    const warnings = await validatePackageJsonDependencies(appPath);

    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('twenty-sdk');
    expect(warnings[0]).toContain('devDependencies');
  });

  it('should not warn when twenty-sdk is listed under devDependencies', async () => {
    appPath = await writeTempPackageJson({
      dependencies: { 'twenty-client-sdk': '^2.8.0' },
      devDependencies: { 'twenty-sdk': '^2.8.0' },
    });

    const warnings = await validatePackageJsonDependencies(appPath);

    expect(warnings).toEqual([]);
  });

  it('should not warn when twenty-sdk is absent from dependencies', async () => {
    appPath = await writeTempPackageJson({
      dependencies: { 'twenty-client-sdk': '^2.8.0' },
    });

    const warnings = await validatePackageJsonDependencies(appPath);

    expect(warnings).toEqual([]);
  });

  it('should not warn when package.json is missing', async () => {
    appPath = await writeTempPackageJson(null);

    const warnings = await validatePackageJsonDependencies(appPath);

    expect(warnings).toEqual([]);
  });
});
