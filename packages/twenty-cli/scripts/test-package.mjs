import { strict as assert } from 'node:assert';
import { execFileSync, fork } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const PACKAGE_DIRECTORY = fileURLToPath(new URL('..', import.meta.url));
const WORKSPACE_DIRECTORY = join(PACKAGE_DIRECTORY, '../..');
const ENVIRONMENT = {
  ...process.env,
  NODE_PATH: '',
  NODE_OPTIONS: '',
  PATH: `${dirname(process.execPath)}:${process.env.PATH}`,
  TWENTY_API_URL: 'http://127.0.0.1:1',
  TWENTY_API_KEY: 'package-smoke-test',
  TWENTY_REMOTE: '',
};

const run = ({ command, commandArguments, workingDirectory }) =>
  execFileSync(command, commandArguments, {
    cwd: workingDirectory,
    env: ENVIRONMENT,
    encoding: 'utf8',
    timeout: 120_000,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

await test('the workspace executable runs directly after a build', async () => {
  const { bin } = JSON.parse(
    await readFile(join(PACKAGE_DIRECTORY, 'package.json'), 'utf8'),
  );
  const output = run({
    command: join(PACKAGE_DIRECTORY, bin),
    commandArguments: ['--help'],
    workingDirectory: WORKSPACE_DIRECTORY,
  });

  assert.match(output, /Usage: twenty/);
});

await test('the packed CLI works outside the monorepo', async (context) => {
  const directory = await mkdtemp(join(tmpdir(), 'twenty-package-'));
  const installDirectory = join(directory, 'installation');
  const archive = join(directory, 'twenty.tgz');

  try {
    await mkdir(installDirectory);
    await writeFile(
      join(installDirectory, 'package.json'),
      JSON.stringify({ private: true }),
    );
    run({
      command: 'yarn',
      commandArguments: ['workspace', 'twenty', 'pack', '--out', archive],
      workingDirectory: WORKSPACE_DIRECTORY,
    });
    run({
      command: 'npm',
      commandArguments: [
        'install',
        '--omit=dev',
        '--no-audit',
        '--no-fund',
        archive,
      ],
      workingDirectory: installDirectory,
    });

    const executable = join(installDirectory, 'node_modules/.bin/twenty');
    const installedPackage = join(installDirectory, 'node_modules/twenty');
    const cli = (...commandArguments) =>
      run({
        command: executable,
        commandArguments,
        workingDirectory: installDirectory,
      });

    await context.test('help loads from the installed executable', () => {
      assert.match(cli('--help'), /Usage: twenty/);
      assert.match(cli('app', '--help'), /Usage: twenty app/);
    });

    await context.test('offline doctor loads its command chunk', () => {
      const result = JSON.parse(cli('doctor', '--offline', '--json'));

      assert.equal(result.ok, true);
      assert.equal(result.command, 'doctor');
      const cliCheck = result.data.checks.find((check) => check.id === 'cli');

      assert.equal(cliCheck.status, 'pass');
      assert.equal(cliCheck.details.entryPoint, executable);
      assert.equal(
        result.data.checks.find((check) => check.id === 'metadata-api').status,
        'skipped',
      );
    });

    await context.test(
      'app init renders the template and its CLI test harness',
      async () => {
        const result = JSON.parse(
          cli('app', 'init', 'smoke-app', '--json', '--no-input'),
        );
        const appDirectory = join(installDirectory, 'smoke-app');
        const packageJson = JSON.parse(
          await readFile(join(appDirectory, 'package.json'), 'utf8'),
        );

        assert.equal(result.ok, true);
        assert.equal(packageJson.name, 'smoke-app');
        assert.match(
          await readFile(
            join(appDirectory, 'src/application-config.ts'),
            'utf8',
          ),
          /defineApplication/,
        );
        assert.match(
          await readFile(
            join(appDirectory, 'src/__tests__/run-twenty.ts'),
            'utf8',
          ),
          /TWENTY_CLI/,
        );
      },
    );

    await context.test(
      'the installed worker reports a real compiler diagnostic',
      async () => {
        const appDirectory = join(installDirectory, 'typecheck-app');

        await mkdir(appDirectory);
        await writeFile(
          join(appDirectory, 'package.json'),
          JSON.stringify({ name: 'typecheck-app' }),
        );
        await writeFile(
          join(appDirectory, 'tsconfig.json'),
          JSON.stringify({
            compilerOptions: { strict: true, types: [], skipLibCheck: true },
            include: ['*.ts'],
          }),
        );
        await writeFile(
          join(appDirectory, 'application.ts'),
          'export const name: string = 42;',
        );

        const { code, response, stderr } = await new Promise(
          (resolve, reject) => {
            const worker = fork(
              join(installedPackage, 'dist/app-worker.cjs'),
              [],
              {
                cwd: appDirectory,
                env: ENVIRONMENT,
                execArgv: [],
                stdio: ['ignore', 'ignore', 'pipe', 'ipc'],
                timeout: 30_000,
              },
            );
            let response;
            let stderr = '';

            worker.stderr.setEncoding('utf8');
            worker.stderr.on('data', (chunk) => {
              stderr += chunk;
            });
            worker.once('error', reject);
            worker.once('message', (message) => {
              response = message;
            });
            worker.once('exit', (code) => resolve({ code, response, stderr }));
            worker.send({ type: 'typecheckSource', appPath: appDirectory });
          },
        );

        assert.equal(code, 0, stderr);
        assert.equal(response.type, 'result');
        assert.equal(response.result.success, false);
        assert.equal(response.result.error.code, 'TYPECHECK_FAILED');
        assert.ok(
          response.result.diagnostics.some(
            (diagnostic) =>
              diagnostic.code === 'TS2322' &&
              diagnostic.file === 'application.ts',
          ),
        );
      },
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
