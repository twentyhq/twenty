import { createRequire } from 'module';
import { join } from 'path';

import { MINIMAL_APP_PATH } from '@/cli/__tests__/apps/fixture-paths';
import { extractManifestFromFile } from '@/cli/utilities/build/manifest/manifest-extract-config-from-file';
import { type ApplicationConfig } from '@/sdk/define';

describe('extractManifestFromFile', () => {
  const filePath = join(MINIMAL_APP_PATH, 'application.config.ts');

  it('extracts the default-exported config from a bundled entity file', async () => {
    const result = await extractManifestFromFile<ApplicationConfig>({
      filePath,
      appPath: MINIMAL_APP_PATH,
    });

    expect(result.config.displayName).toBe('Root App');
  }, 60000);

  // Regression test for the dev-mode OOM crash: bundled entity modules used to be
  // written to disk and required, leaking one fully-bundled module per file into
  // the require cache on every rebuild. Evaluating in memory keeps it bounded.
  it('does not grow the require cache across rebuilds', async () => {
    const requireCache = createRequire(import.meta.url).cache;

    // Warm up so first-time dependency loads don't count against the assertion.
    await extractManifestFromFile<ApplicationConfig>({
      filePath,
      appPath: MINIMAL_APP_PATH,
    });

    const before = Object.keys(requireCache).length;

    for (let index = 0; index < 5; index++) {
      await extractManifestFromFile<ApplicationConfig>({
        filePath,
        appPath: MINIMAL_APP_PATH,
      });
    }

    expect(Object.keys(requireCache).length).toBe(before);
  }, 60000);
});
