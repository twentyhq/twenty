import { createRequire } from 'module';
import { join } from 'path';

import { MINIMAL_APP_PATH } from '@/cli/__tests__/apps/fixture-paths';
import { extractManifestFromFile } from '@/cli/utilities/build/manifest/manifest-extract-config-from-file';

describe('extractManifestFromFile', () => {
  // Regression test for the dev-mode OOM crash: every build compiled each entity
  // file to a temp module and required it without evicting it from the require
  // cache, leaking one fully-bundled module per file on every rebuild.
  it('does not leak compiled modules into the require cache across rebuilds', async () => {
    const filePath = join(MINIMAL_APP_PATH, 'application.config.ts');
    const requireCache = createRequire(import.meta.url).cache;

    const countTempModules = () =>
      Object.keys(requireCache).filter((key) => key.includes('twenty-manifest'))
        .length;

    const before = countTempModules();

    for (let index = 0; index < 5; index++) {
      await extractManifestFromFile({ filePath, appPath: MINIMAL_APP_PATH });
    }

    expect(countTempModules()).toBe(before);
  }, 60000);
});
