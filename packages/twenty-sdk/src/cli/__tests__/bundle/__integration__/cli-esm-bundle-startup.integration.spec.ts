import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import packageJson from '../../../../../package.json';

const currentDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(currentDir, '../../../../..');

describe.each(['cjs', 'mjs'])('SDK CLI %s bundle startup', (extension) => {
  const bundledCliEntry = resolve(packageRoot, `dist/cli.${extension}`);
  const isBundleBuilt = existsSync(bundledCliEntry);
  const runOrSkip = isBundleBuilt || process.env.CI ? it : it.skip;
  const runCli = (args: string[]) => {
    if (!isBundleBuilt) {
      throw new Error(
        `Expected the built entry at ${bundledCliEntry}. Build twenty-sdk before this test.`,
      );
    }

    return spawnSync(process.execPath, [bundledCliEntry, ...args], {
      encoding: 'utf8',
      timeout: 30_000,
    });
  };

  runOrSkip('shows migration guidance on stderr while help still works', () => {
    const result = runCli(['--help']);
    const combinedOutput = `${result.stdout}\n${result.stderr}`;

    expect(combinedOutput).not.toMatch(/Calling `require` for/);
    expect(combinedOutput).not.toMatch(/is not defined in ES module scope/);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Usage: twenty');
    expect(result.stderr).toContain(
      'CLI bundled with twenty-sdk is deprecated',
    );
    expect(result.stderr).toContain('npm install -g twenty');
    expect(result.stdout).not.toContain('Warning:');
  });

  runOrSkip('preserves machine-readable version output', () => {
    const result = runCli(['--version']);

    expect(result.status).toBe(0);
    expect(result.stdout).toBe(`${packageJson.version}\n`);
    expect(result.stderr).toContain(
      'CLI bundled with twenty-sdk is deprecated',
    );
  });

  runOrSkip('keeps SDK publishing commands available', () => {
    const result = runCli(['app:publish', '--help']);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Usage: twenty app:publish');
    expect(result.stdout).toContain('--private');
  });

  runOrSkip('preserves failures for unknown commands', () => {
    const result = runCli(['unknown-command']);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("unknown command 'unknown-command'");
    expect(result.stderr).toContain(
      'CLI bundled with twenty-sdk is deprecated',
    );
  });

  runOrSkip.each(['build', 'operations', 'define/index'])(
    'does not print the CLI warning when importing %s',
    (entry) => {
      const entryUrl = pathToFileURL(
        resolve(packageRoot, `dist/${entry}.${extension}`),
      ).href;
      const result = spawnSync(
        process.execPath,
        [
          '--input-type=module',
          '--eval',
          `await import(${JSON.stringify(entryUrl)})`,
        ],
        { encoding: 'utf8', timeout: 30_000 },
      );

      expect(result.stderr).toBe('');
      expect(result.stdout).toBe('');
      expect(result.status).toBe(0);
    },
  );
});
