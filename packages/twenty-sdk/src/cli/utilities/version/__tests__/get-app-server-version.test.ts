import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { getAppServerVersion } from '@/cli/utilities/version/get-app-server-version';

const createPackageJson = (contents: unknown): string => {
  const dir = mkdtempSync(join(tmpdir(), 'twenty-app-server-version-'));

  writeFileSync(join(dir, 'package.json'), JSON.stringify(contents), 'utf-8');

  return dir;
};

describe('getAppServerVersion', () => {
  const createdDirs: string[] = [];

  const seed = (contents: unknown): string => {
    const dir = createPackageJson(contents);

    createdDirs.push(dir);

    return dir;
  };

  afterEach(() => {
    while (createdDirs.length > 0) {
      rmSync(createdDirs.pop() as string, { recursive: true, force: true });
    }
  });

  it('returns the pinned twenty.serverVersion', () => {
    const dir = seed({ twenty: { serverVersion: '1.4.2' } });

    expect(getAppServerVersion(dir)).toBe('1.4.2');
  });

  it('trims surrounding whitespace', () => {
    const dir = seed({ twenty: { serverVersion: '  1.4.2  ' } });

    expect(getAppServerVersion(dir)).toBe('1.4.2');
  });

  it('returns null when the field is missing', () => {
    const dir = seed({ name: 'my-app' });

    expect(getAppServerVersion(dir)).toBeNull();
  });

  it('returns null when the field is empty', () => {
    const dir = seed({ twenty: { serverVersion: '   ' } });

    expect(getAppServerVersion(dir)).toBeNull();
  });

  it('returns null when no package.json exists', () => {
    const dir = mkdtempSync(join(tmpdir(), 'twenty-app-server-version-empty-'));

    createdDirs.push(dir);

    expect(getAppServerVersion(dir)).toBeNull();
  });
});
