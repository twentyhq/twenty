import { strict as assert } from 'node:assert';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { networkInterfaces, tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { runServer } from 'verdaccio';

const PACKAGE_DIRECTORY = fileURLToPath(new URL('..', import.meta.url));
const WORKSPACE_DIRECTORY = join(PACKAGE_DIRECTORY, '../..');
const PACKAGE_NAME = 'twenty-cli-publish-test';
const PACKAGE_VERSION = '0.0.0-ci.1';
const execute = promisify(execFile);

await test(
  'app publish uploads a built app to a local npm registry',
  {
    timeout: 180_000,
  },
  async (context) => {
    if (process.env.CI === 'true') {
      assert.ok(
        Object.values(networkInterfaces())
          .flat()
          .every((address) => address.internal),
        'Run the publishing test in a network namespace with only loopback enabled.',
      );
    }

    const directory = await realpath(
      await mkdtemp(join(tmpdir(), 'twenty-app-publish-')),
    );
    let registry;
    context.after(async () => {
      if (registry?.listening) {
        registry.closeAllConnections();
        await new Promise((resolve, reject) =>
          registry.close((error) => (error ? reject(error) : resolve())),
        );
      }
      await rm(directory, { recursive: true, force: true });
    });
    registry = await runServer({
      storage: join(directory, 'registry'),
      self_path: join(directory, 'config.yaml'),
      auth: { htpasswd: { file: join(directory, 'htpasswd') } },
      uplinks: {},
      packages: { [PACKAGE_NAME]: { access: '$all', publish: '$all' } },
      log: { type: 'stdout', format: 'pretty', level: 'fatal' },
    });
    registry.listen(0, '127.0.0.1');
    await once(registry, 'listening');
    const registryUrl = `http://127.0.0.1:${registry.address().port}`;
    const appDirectory = join(directory, 'app with spaces');
    await cp(
      join(
        WORKSPACE_DIRECTORY,
        'packages/twenty-apps/fixtures/function-execute-app',
      ),
      appDirectory,
      {
        recursive: true,
        filter: (source) =>
          !['node_modules', '.twenty', 'dist'].includes(basename(source)),
      },
    );
    await mkdir(join(appDirectory, 'node_modules'));
    for (const name of [
      'twenty-sdk',
      'twenty-client-sdk',
      'typescript',
      '@types',
    ]) {
      await symlink(
        join(WORKSPACE_DIRECTORY, 'node_modules', name),
        join(appDirectory, 'node_modules', name),
        'dir',
      );
    }
    const packagePath = join(appDirectory, 'package.json');
    const packageJson = JSON.parse(await readFile(packagePath, 'utf8'));
    Object.assign(packageJson, {
      name: PACKAGE_NAME,
      version: PACKAGE_VERSION,
      publishConfig: { registry: registryUrl },
      scripts: {
        prepack: 'node -e "process.exit(91)"',
        prepublishOnly: 'node -e "process.exit(92)"',
      },
    });
    await writeFile(packagePath, JSON.stringify(packageJson));
    const userConfig = join(directory, 'npmrc');
    const globalConfig = join(directory, 'global-npmrc');
    await writeFile(
      userConfig,
      `registry=${registryUrl}\n//127.0.0.1:${registry.address().port}/:_authToken=ci-auth-token\n`,
    );
    await writeFile(globalConfig, '');
    const environment = {
      PATH: `${dirname(process.execPath)}:${process.env.PATH}`,
      CI: 'true',
      TWENTY_CONFIG_HOME: join(directory, 'twenty-config'),
      TWENTY_APP_PUBLISH_DISABLE_PROVENANCE: 'true',
      npm_config_registry: registryUrl,
      npm_config_userconfig: userConfig,
      npm_config_globalconfig: globalConfig,
      npm_config_cache: join(directory, 'npm-cache'),
      npm_config_audit: 'false',
      npm_config_fund: 'false',
      npm_config_update_notifier: 'false',
    };
    const publish = () =>
      execute(
        process.execPath,
        [
          join(PACKAGE_DIRECTORY, 'dist/cli.cjs'),
          'app',
          'publish',
          '--path',
          appDirectory,
          '--tag',
          'ci',
          '--json',
          '--no-input',
        ],
        {
          cwd: directory,
          env: environment,
          timeout: 60_000,
          maxBuffer: 4 * 1024 * 1024,
        },
      );
    const readMetadata = async () => {
      const response = await fetch(`${registryUrl}/${PACKAGE_NAME}`, {
        signal: context.signal,
      });
      assert.equal(response.status, 200);
      return response.json();
    };
    const assertCleanedUp = async () =>
      assert.deepEqual(
        await readdir(join(appDirectory, '.twenty/cli/snapshots')),
        [],
      );

    await context.test(
      'publishes real tarball contents and the requested tag without lifecycle scripts',
      async () => {
        const { stdout } = await publish();
        const result = JSON.parse(stdout);
        assert.equal(result.ok, true, stdout);
        assert.equal(result.data.target, 'npm');
        assert.equal(result.data.name, PACKAGE_NAME);
        assert.equal(result.data.version, PACKAGE_VERSION);
        assert.equal(result.data.tag, 'ci');

        const metadata = await readMetadata();
        assert.equal(metadata['dist-tags'].ci, PACKAGE_VERSION);
        const published = metadata.versions[PACKAGE_VERSION];
        const tarballUrl = new URL(published.dist.tarball);
        assert.equal(tarballUrl.origin, registryUrl);
        const response = await fetch(tarballUrl, { signal: context.signal });
        assert.equal(response.status, 200);
        const tarball = Buffer.from(await response.arrayBuffer());
        assert.equal(
          published.dist.integrity,
          `sha512-${createHash('sha512').update(tarball).digest('base64')}`,
        );
        const archive = join(directory, 'published.tgz');
        await writeFile(archive, tarball);
        const readArchiveFile = async (file) =>
          (await execute('tar', ['-xOf', archive, `package/${file}`])).stdout;
        const packedPackage = JSON.parse(await readArchiveFile('package.json'));
        assert.equal(packedPackage.name, PACKAGE_NAME);
        assert.equal(packedPackage.version, PACKAGE_VERSION);
        const manifest = JSON.parse(await readArchiveFile('manifest.json'));
        assert.equal(
          manifest.application.universalIdentifier,
          '01e065d6-1b48-4107-86d8-b06f87420a4f',
        );
        const logicFunction = manifest.logicFunctions.find(
          (entry) => entry.name === 'add-numbers',
        );
        assert.ok(logicFunction);
        assert.match(
          await readArchiveFile(logicFunction.builtHandlerPath),
          /Adding/,
        );
        await assertCleanedUp();
      },
    );

    await context.test(
      'reports a rejected duplicate version and removes temporary files',
      async () => {
        await assert.rejects(publish(), (error) => {
          assert.equal(error.code, 1);
          const result = JSON.parse(error.stdout);
          assert.equal(result.ok, false);
          assert.equal(result.error.code, 'PUBLISH_FAILED');
          return true;
        });
        assert.deepEqual(Object.keys((await readMetadata()).versions), [
          PACKAGE_VERSION,
        ]);
        await assertCleanedUp();
      },
    );

    await context.test(
      'rejects an incomplete npm package before uploading a new version',
      async () => {
        await writeFile(
          packagePath,
          JSON.stringify({
            ...packageJson,
            version: '0.0.0-ci.2',
            files: ['package.json'],
          }),
        );
        await assert.rejects(publish(), (error) => {
          assert.equal(error.code, 1);
          const result = JSON.parse(error.stdout);
          assert.equal(result.error.code, 'PUBLISH_FAILED');
          assert.ok(
            result.error.details.missingPaths.includes('manifest.json'),
          );
          return true;
        });
        assert.deepEqual(Object.keys((await readMetadata()).versions), [
          PACKAGE_VERSION,
        ]);
        await assertCleanedUp();
      },
    );
  },
);
