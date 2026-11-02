import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

import { installYarnDependencies } from 'src/engine/core-modules/application/application-package/constants/yarn-engine/install-yarn-dependencies.cjs';

jest.useRealTimers();

describe('installYarnDependencies', () => {
  let directory: string;
  let yarnEngineDirectory: string;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'yarn-install-test-'));
    yarnEngineDirectory = join(directory, 'engine');
    await mkdir(join(yarnEngineDirectory, '.yarn/releases'), {
      recursive: true,
    });
    await writeFile(
      join(yarnEngineDirectory, '.yarn/releases/yarn-4.9.2.cjs'),
      `
const { writeFileSync } = require('fs');
writeFileSync('install-result.json', JSON.stringify({
  args: process.argv.slice(2),
  cwd: process.cwd(),
  nodeOptions: process.env.NODE_OPTIONS,
  scripts: process.env.YARN_ENABLE_SCRIPTS,
}));
`,
    );
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await rm(directory, { recursive: true, force: true });
  });

  it.each([
    ['install', '--immutable'],
    ['workspaces', 'focus', '--all', '--production'],
  ])('runs the copied engine with caller arguments %j', async (...args) => {
    const destination = join(directory, 'install');
    jest.replaceProperty(process, 'env', {
      ...process.env,
      NODE_OPTIONS: '--require=/missing-parent-loader.cjs',
    });

    await installYarnDependencies({
      directory: destination,
      yarnEngineDirectory,
      args,
      env: { YARN_ENABLE_SCRIPTS: 'false' },
      timeout: 5000,
    });

    const result = JSON.parse(
      await readFile(join(destination, 'install-result.json'), 'utf8'),
    );
    expect(result).toEqual({
      args,
      cwd: await realpath(destination),
      scripts: 'false',
    });
  });

  it('preserves installer stderr on failure', async () => {
    await writeFile(
      join(yarnEngineDirectory, '.yarn/releases/yarn-4.9.2.cjs'),
      `process.stderr.write('dependency resolution failed'); process.exit(1);`,
    );

    await expect(
      installYarnDependencies({
        directory: join(directory, 'install'),
        yarnEngineDirectory,
        args: ['install', '--immutable'],
        timeout: 5000,
      }),
    ).rejects.toMatchObject({
      stderr: 'dependency resolution failed',
      code: 1,
    });
  });
});
