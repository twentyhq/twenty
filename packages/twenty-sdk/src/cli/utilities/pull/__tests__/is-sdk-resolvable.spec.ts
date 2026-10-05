import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { isSdkResolvable } from '@/cli/utilities/pull/is-sdk-resolvable';

describe('isSdkResolvable', () => {
  let appPath: string;

  beforeEach(async () => {
    appPath = await mkdtemp(join(tmpdir(), 'is-sdk-resolvable-'));
    await writeFile(
      join(appPath, 'package.json'),
      JSON.stringify({ name: 'app', version: '1.0.0', private: true }),
    );
  });

  afterEach(async () => {
    await rm(appPath, { recursive: true, force: true });
  });

  it('should be false when the project has no twenty-sdk installed', () => {
    expect(isSdkResolvable(appPath)).toBe(false);
  });

  it('should be true when twenty-sdk exposes its define entry point', async () => {
    const sdkPath = join(appPath, 'node_modules', 'twenty-sdk');

    await mkdir(sdkPath, { recursive: true });
    await writeFile(
      join(sdkPath, 'package.json'),
      JSON.stringify({
        name: 'twenty-sdk',
        version: '0.0.0',
        exports: { './define': './define.js' },
      }),
    );
    await writeFile(join(sdkPath, 'define.js'), 'module.exports = {};\n');

    expect(isSdkResolvable(appPath)).toBe(true);
  });
});
