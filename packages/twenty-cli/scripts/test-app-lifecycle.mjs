import { strict as assert } from 'node:assert';
import { execFile } from 'node:child_process';
import {
  cp,
  mkdir,
  mkdtemp,
  realpath,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const PACKAGE_DIRECTORY = fileURLToPath(new URL('..', import.meta.url));
const WORKSPACE_DIRECTORY = join(PACKAGE_DIRECTORY, '../..');
const execute = promisify(execFile);

await test(
  'standalone CLI app lifecycle',
  { timeout: 900_000 },
  async (context) => {
    const directory = await realpath(
      await mkdtemp(join(tmpdir(), 'twenty-app-lifecycle-')),
    );
    const installedApps = new Set();
    const environment = {
      PATH: `${dirname(process.execPath)}:${process.env.PATH}`,
      CI: 'true',
      HOME: join(directory, 'home'),
    };
    const cli = async (appPath, args, { allowFailure = false } = {}) => {
      let output;
      try {
        output = await execute(
          process.execPath,
          [
            join(PACKAGE_DIRECTORY, 'dist/cli.cjs'),
            'app',
            ...args,
            '--path',
            appPath,
            '--json',
            '--no-input',
          ],
          {
            cwd: directory,
            env: environment,
            timeout: 180_000,
            maxBuffer: 4 * 1024 * 1024,
          },
        );
      } catch (error) {
        if (!allowFailure || !error.stdout) throw error;
        output = error;
      }
      const result = JSON.parse(output.stdout);
      if (!allowFailure) assert.equal(result.ok, true, output.stdout);
      return result;
    };
    context.after(async () => {
      try {
        const failures = [];
        for (const appPath of installedApps) {
          try {
            const result = await cli(appPath, ['uninstall', '--yes'], {
              allowFailure: true,
            });
            assert.ok(
              result.ok || result.error.code === 'APP_NOT_INSTALLED',
              JSON.stringify(result),
            );
          } catch (error) {
            failures.push(error);
          }
        }
        if (failures.length) {
          throw new AggregateError(
            failures,
            'Could not uninstall test applications',
          );
        }
      } finally {
        await rm(directory, { recursive: true, force: true });
      }
    });
    const prepareDependencies = async (appPath) => {
      // These fixtures use dependencies from the checkout.
      await rm(join(appPath, 'yarn.lock'), { force: true });
      const modules = join(appPath, 'node_modules');
      await mkdir(modules);
      for (const name of [
        'twenty-sdk',
        'twenty-shared',
        'twenty-ui',
        'typescript',
        'react',
        'react-dom',
        '@types',
        'vitest',
        'vite-tsconfig-paths',
      ]) {
        await symlink(
          join(WORKSPACE_DIRECTORY, 'node_modules', name),
          join(modules, name),
          'dir',
        );
      }
      const client = join(modules, 'twenty-client-sdk');
      await mkdir(client);
      for (const name of ['dist', 'package.json']) {
        await cp(
          join(WORKSPACE_DIRECTORY, 'packages/twenty-client-sdk', name),
          join(client, name),
          { recursive: true },
        );
      }
      await symlink(
        join(WORKSPACE_DIRECTORY, 'node_modules'),
        join(client, 'node_modules'),
        'dir',
      );
    };
    const appPaths = Object.fromEntries(
      ['scaffolded-app', 'rich-app', 'function-execute-app'].map((name) => [
        name,
        join(directory, name),
      ]),
    );

    for (const [name, appPath] of Object.entries(appPaths)) {
      await context.test(`builds ${name} with the current SDK`, async () => {
        if (name === 'scaffolded-app') {
          await cli(appPath, ['init', name]);
        } else {
          await cp(
            join(WORKSPACE_DIRECTORY, 'packages/twenty-apps/fixtures', name),
            appPath,
            {
              recursive: true,
              filter: (source) =>
                !['node_modules', '.twenty', 'dist'].includes(basename(source)),
            },
          );
        }
        await prepareDependencies(appPath);
        await cli(appPath, ['build']);
      });
    }

    const liveOptions = {
      skip: process.env.CI !== 'true' && !process.env.TWENTY_API_URL,
    };
    const assertLocalServer = () => {
      assert.ok(
        process.env.TWENTY_ACCESS_TOKEN,
        'TWENTY_ACCESS_TOKEN must authenticate a user in the disposable test workspace',
      );
      assert.ok(
        ['localhost', '127.0.0.1', '[::1]'].includes(
          new URL(process.env.TWENTY_API_URL).hostname,
        ),
        'Use a local test server',
      );
    };
    const assertInstalled = async (universalIdentifier, expected) => {
      const response = await fetch(
        new URL('/metadata', process.env.TWENTY_API_URL),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.TWENTY_ACCESS_TOKEN}`,
          },
          body: JSON.stringify({
            query: 'query { findManyApplications { universalIdentifier } }',
          }),
          signal: AbortSignal.timeout(30_000),
        },
      );
      assert.equal(response.ok, true);
      const result = await response.json();
      assert.equal(result.errors, undefined, JSON.stringify(result.errors));
      assert.equal(
        result.data.findManyApplications.some(
          (app) => app.universalIdentifier === universalIdentifier,
        ),
        expected,
      );
    };

    await context.test(
      'configures the seeded user session',
      liveOptions,
      async () => {
        assertLocalServer();
        const claims = JSON.parse(
          Buffer.from(
            process.env.TWENTY_ACCESS_TOKEN.split('.')[1],
            'base64url',
          ),
        );
        assert.equal(claims.type, 'ACCESS');
        assert.ok(claims.userId);
        const configDirectory = join(environment.HOME, '.twenty');
        await mkdir(configDirectory, { recursive: true, mode: 0o700 });
        await writeFile(
          join(configDirectory, 'config.json'),
          JSON.stringify({
            version: 1,
            defaultRemote: 'test',
            remotes: {
              test: {
                apiUrl: process.env.TWENTY_API_URL,
                twentyCLIAccessToken: process.env.TWENTY_ACCESS_TOKEN,
              },
            },
          }),
          { mode: 0o600 },
        );
      },
    );

    await context.test(
      'applies a scaffolded app and executes its health check',
      liveOptions,
      async () => {
        assertLocalServer();
        const appPath = appPaths['scaffolded-app'];
        installedApps.add(appPath);
        const applied = await cli(appPath, ['apply', '--create', '--yes']);
        assert.equal(applied.data.clientGeneration, 'generated');
        await assertInstalled(
          applied.data.application.universalIdentifier,
          true,
        );
        const execution = await cli(appPath, [
          'exec',
          '--name',
          'health-check',
        ]);
        assert.equal(execution.data.status, 'SUCCESS');
        assert.deepEqual(execution.data.data, { status: 'OK' });
      },
    );

    await context.test(
      'installs, uninstalls and reinstalls rich-app',
      liveOptions,
      async () => {
        assertLocalServer();
        const appPath = appPaths['rich-app'];
        installedApps.add(appPath);
        const applied = await cli(appPath, ['apply', '--create', '--yes']);
        const identifier = applied.data.application.universalIdentifier;
        await assertInstalled(identifier, true);
        await cli(appPath, ['uninstall', '--yes']);
        installedApps.delete(appPath);
        await assertInstalled(identifier, false);
        installedApps.add(appPath);
        await cli(appPath, ['apply', '--create', '--yes']);
        await assertInstalled(identifier, true);
      },
    );

    await context.test(
      'publishes and installs an app, then executes by name and identifier',
      liveOptions,
      async () => {
        assertLocalServer();
        const appPath = appPaths['function-execute-app'];
        await cli(appPath, ['publish', '--private']);
        installedApps.add(appPath);
        await cli(appPath, ['install']);
        for (const [selector, payload, expected] of [
          [['--name', 'add-numbers'], { a: 3, b: 7 }, 10],
          [
            ['--universal-identifier', 'f9e5589c-e951-4d99-85db-0a305ab53502'],
            { a: 100, b: 200 },
            300,
          ],
        ]) {
          const execution = await cli(appPath, [
            'exec',
            ...selector,
            '--payload',
            JSON.stringify(payload),
          ]);
          assert.equal(execution.data.status, 'SUCCESS');
          assert.equal(execution.data.data, expected);
        }
        const missing = await cli(
          appPath,
          ['exec', '--name', 'non-existent-function'],
          { allowFailure: true },
        );
        assert.equal(missing.ok, false);
        assert.equal(missing.error.code, 'NOT_FOUND');
      },
    );
  },
);
