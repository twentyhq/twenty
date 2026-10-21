import { existsSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(currentDir, '../../../../..');

// App builds inline these entries into every logic function, so twenty-shared code they reach ships with each one
const RUNTIME_ENTRY_MAX_BYTES = 50_000;

describe.each(['logic-function', 'billing', 'utils'])(
  '%s runtime entry',
  (entryName) => {
    const entryPath = resolve(packageRoot, `dist/${entryName}/index.mjs`);
    const isBundleBuilt = existsSync(entryPath);
    const runOrSkip = isBundleBuilt || process.env.CI ? it : it.skip;

    runOrSkip(`stays under ${RUNTIME_ENTRY_MAX_BYTES} bytes`, () => {
      if (!isBundleBuilt) {
        throw new Error(
          `Expected the built entry at ${entryPath}. Build twenty-sdk before this test.`,
        );
      }

      expect(statSync(entryPath).size).toBeLessThan(RUNTIME_ENTRY_MAX_BYTES);
    });
  },
);
