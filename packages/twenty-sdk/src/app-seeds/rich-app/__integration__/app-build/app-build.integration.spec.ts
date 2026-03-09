import { readdir, rm } from 'node:fs/promises';
import { join } from 'path';

import { appBuild } from '@/cli/public-operations/app-build';
import { pathExists } from '@/cli/utilities/file/fs-utils';
import { GENERATED_DIR, OUTPUT_DIR } from 'twenty-shared/application';

const APP_PATH = join(__dirname, '../..');

describe('rich-app app:build', () => {
  let buildResult: Awaited<ReturnType<typeof appBuild>>;

  beforeAll(async () => {
    const generatedPath = join(
      APP_PATH,
      'node_modules',
      'twenty-sdk',
      GENERATED_DIR,
    );

    await rm(generatedPath, { recursive: true, force: true });

    buildResult = await appBuild({ appPath: APP_PATH });
  }, 60_000);

  it('should complete build successfully', () => {
    expect(buildResult.success).toBe(true);
  });

  it('should produce manifest in output directory', async () => {
    const manifestPath = join(APP_PATH, OUTPUT_DIR, 'manifest.json');

    expect(await pathExists(manifestPath)).toBe(true);
  });

  it('should produce built logic function files', async () => {
    const outputDir = join(APP_PATH, OUTPUT_DIR);
    const files = await readdir(outputDir, { recursive: true });
    const functionFiles = files
      .map((file) => file.toString())
      .filter((file) => file.endsWith('.function.mjs'))
      .sort();

    expect(functionFiles.length).toBeGreaterThan(0);
  });
});
