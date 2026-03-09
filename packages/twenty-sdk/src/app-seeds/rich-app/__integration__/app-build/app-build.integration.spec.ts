import { readdir, readFile, rm } from 'node:fs/promises';
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

  // app:build only creates client stubs (empty CoreApiClient / MetadataApiClient)
  // because it doesn't sync with the server or generate the real API client.
  // Logic functions that use CoreApiClient will get an empty class at runtime.
  // When this is fixed, update this test to assert the client IS fully generated.
  // See: https://github.com/twentyhq/twenty/pull/18460
  it('should only produce client stubs (not a fully generated CoreApiClient)', async () => {
    const clientIndexPath = join(
      APP_PATH,
      'node_modules',
      'twenty-sdk',
      GENERATED_DIR,
      'core',
      'index.ts',
    );

    const content = await readFile(clientIndexPath, 'utf-8');

    expect(content).toBe('export class CoreApiClient {}\n');
  });
});
