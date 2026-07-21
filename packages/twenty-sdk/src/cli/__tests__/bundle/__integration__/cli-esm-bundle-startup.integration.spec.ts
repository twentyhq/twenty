import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(currentDir, '../../../../..');
const bundledCliEntry = resolve(packageRoot, 'dist/cli.mjs');
const isBundleBuilt = existsSync(bundledCliEntry);

describe('CLI ESM bundle startup', () => {
  const runOrSkip = isBundleBuilt || process.env.CI ? it : it.skip;

  runOrSkip(
    'runs `--help` from the bundled .mjs entry without a CJS-in-ESM crash',
    () => {
      if (!isBundleBuilt) {
        throw new Error(
          `Expected the built ESM entry at ${bundledCliEntry}. Run \`npx nx build twenty-sdk\` before this test.`,
        );
      }

      const result = spawnSync('node', [bundledCliEntry, '--help'], {
        encoding: 'utf8',
        timeout: 30_000,
      });

      const combinedOutput = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;

      expect(combinedOutput).not.toMatch(/Calling `require` for/);
      expect(combinedOutput).not.toMatch(/is not defined in ES module scope/);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('Usage: twenty');
    },
  );
});
