import { strict as assert } from 'node:assert';
import { chmod, cp, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  checkPublishReadiness,
  PublishCheckError,
} from './check-publish-readiness.mjs';

const PACKAGE_VERSION = '1.0.0';
const PINS = [
  { name: 'twenty-client-sdk', version: '2.45.0' },
  { name: 'twenty-sdk', version: '2.45.0' },
  { name: 'twenty-ui', version: '2.45.0' },
];

const registryStatuses = new Map();
const registry = createServer((request, response) => {
  response.statusCode = registryStatuses.get(request.url) ?? 404;
  response.end('{}');
});

await new Promise((resolve, reject) => {
  registry.once('error', reject);
  registry.listen(0, '127.0.0.1', resolve);
});
registry.unref();

const registryUrl = `http://127.0.0.1:${registry.address().port}`;
let root;

const createCliSource = ({
  version = PACKAGE_VERSION,
  exitCode = 0,
  hangs = false,
  reportedPins = PINS,
  renderedPins = PINS,
  skippedFiles = [],
}) => `#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
require('./chunks/commands.cjs');
const options = ${JSON.stringify({ version, exitCode, hangs, reportedPins, renderedPins, skippedFiles })};
const [command, subcommand, appName] = process.argv.slice(2);
const writeAppFile = (appDirectory, file, content) => {
  if (options.skippedFiles.includes(file)) {
    return;
  }
  fs.mkdirSync(path.dirname(path.join(appDirectory, file)), { recursive: true });
  fs.writeFileSync(path.join(appDirectory, file), content);
};
const reply = (data) => {
  console.log(JSON.stringify({ ok: true, data }));
  if (options.hangs) {
    setTimeout(() => {}, 60_000);
  }
  process.exitCode = options.exitCode;
};
if (command === 'version') {
  reply({ version: options.version });
} else if (command === 'app' && subcommand === 'init') {
  const appDirectory = path.join(process.cwd(), appName);
  const devDependencies = Object.fromEntries(
    options.renderedPins.map(({ name, version }) => [name, version]),
  );
  writeAppFile(appDirectory, 'package.json', JSON.stringify({ devDependencies }));
  writeAppFile(appDirectory, 'tsconfig.json', '{}');
  writeAppFile(appDirectory, '.yarnrc.yml', 'nodeLinker: node-modules');
  writeAppFile(appDirectory, 'src/application-config.ts', 'export default defineApplication({});');
  writeAppFile(appDirectory, 'src/__tests__/run-twenty.ts', 'export {};');
  reply({ packages: options.reportedPins });
}
`;

const createPackage = async (cliOptions = {}) => {
  const packageDirectory = join(root, 'twenty-cli');
  const templateDirectory = join(packageDirectory, 'app-template');
  const executable = join(packageDirectory, 'dist/cli.cjs');

  await mkdir(join(packageDirectory, 'dist/chunks'), { recursive: true });
  await mkdir(join(templateDirectory, 'src/__tests__'), { recursive: true });
  await writeFile(
    join(packageDirectory, 'package.json'),
    JSON.stringify({
      name: 'twenty',
      version: PACKAGE_VERSION,
      bin: 'dist/cli.cjs',
    }),
  );
  await writeFile(executable, createCliSource(cliOptions));
  await chmod(executable, 0o755);
  await writeFile(
    join(packageDirectory, 'dist/chunks/commands.cjs'),
    'module.exports = {};',
  );
  await writeFile(
    join(packageDirectory, 'dist/app-worker.cjs'),
    'require("./chunks/commands.cjs");',
  );
  await writeFile(join(templateDirectory, 'package.json'), '{}');
  await writeFile(
    join(templateDirectory, 'src/__tests__/run-twenty.ts'),
    'export {};',
  );
  await cp(templateDirectory, join(packageDirectory, 'dist/app-template'), {
    recursive: true,
  });

  return packageDirectory;
};

const assertFailure = (promise, pattern) =>
  assert.rejects(promise, (error) => {
    assert.ok(error instanceof PublishCheckError, error);
    assert.match(error.message, pattern);

    return true;
  });

const testPublishCheck = (name, run) =>
  test(name, async () => {
    root = await mkdtemp(join(tmpdir(), 'twenty-publish-check-test-'));
    registryStatuses.clear();

    for (const pin of PINS) {
      registryStatuses.set(`/${pin.name}/${pin.version}`, 200);
    }

    try {
      await run();
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

await testPublishCheck(
  'accepts a complete build whose app init pins are on npm',
  async () => {
    const packageDirectory = await createPackage();

    assert.deepEqual(
      await checkPublishReadiness({ packageDirectory, registryUrl }),
      {
        version: PACKAGE_VERSION,
        executable: 'dist/cli.cjs',
        bundleFileCount: 3,
        templateFileCount: 2,
        pins: PINS,
      },
    );
  },
);

await testPublishCheck('refuses a package without its executable', async () => {
  const packageDirectory = await createPackage();

  await rm(join(packageDirectory, 'dist/cli.cjs'));
  await assertFailure(
    checkPublishReadiness({ packageDirectory, registryUrl }),
    /^dist\/cli\.cjs is missing/,
  );
});

await testPublishCheck(
  'refuses a build whose lazy chunk is missing',
  async () => {
    const packageDirectory = await createPackage();

    await rm(join(packageDirectory, 'dist/chunks/commands.cjs'));
    await assertFailure(
      checkPublishReadiness({ packageDirectory, registryUrl }),
      /requires \.\/chunks\/commands\.cjs, which is missing/,
    );
  },
);

await testPublishCheck(
  'refuses a missing or stale copy of the app template',
  async () => {
    const packageDirectory = await createPackage();
    const copiedFile = join(packageDirectory, 'dist/app-template/package.json');

    await writeFile(copiedFile, '{"stale":true}');
    await assertFailure(
      checkPublishReadiness({ packageDirectory, registryUrl }),
      /^dist\/app-template\/package\.json differs from/,
    );

    await rm(copiedFile);
    await assertFailure(
      checkPublishReadiness({ packageDirectory, registryUrl }),
      /^dist\/app-template\/package\.json is missing/,
    );
  },
);

await testPublishCheck('refuses a build made for another version', async () => {
  const packageDirectory = await createPackage({ version: '0.9.0' });

  await assertFailure(
    checkPublishReadiness({ packageDirectory, registryUrl }),
    /dist was built as version 0\.9\.0, but package\.json is 1\.0\.0/,
  );
});

await testPublishCheck(
  'refuses a CLI run that exits with an error after printing success',
  async () => {
    const packageDirectory = await createPackage({ exitCode: 1 });

    await assertFailure(
      checkPublishReadiness({ packageDirectory, registryUrl }),
      /^twenty version exited with code 1 without an error result/,
    );
  },
);

await testPublishCheck(
  'refuses a CLI run that does not finish in time',
  async () => {
    const packageDirectory = await createPackage({ hangs: true });

    await assertFailure(
      checkPublishReadiness({
        packageDirectory,
        registryUrl,
        commandTimeoutMilliseconds: 1_000,
      }),
      /^twenty version timed out after 1s/,
    );
  },
);

await testPublishCheck(
  'refuses an app init that leaves out an essential file',
  async () => {
    const packageDirectory = await createPackage({
      skippedFiles: ['.yarnrc.yml'],
    });

    await assertFailure(
      checkPublishReadiness({ packageDirectory, registryUrl }),
      /^app init did not create \.yarnrc\.yml/,
    );
  },
);

await testPublishCheck(
  'refuses pins that differ from the generated package.json',
  async () => {
    const packageDirectory = await createPackage({
      renderedPins: PINS.map((pin) =>
        pin.name === 'twenty-sdk' ? { ...pin, version: '2.44.0' } : pin,
      ),
    });

    await assertFailure(
      checkPublishReadiness({ packageDirectory, registryUrl }),
      /reported twenty-sdk@2\.45\.0, but the generated package\.json pins 2\.44\.0/,
    );
  },
);

await testPublishCheck('refuses pins that npm does not serve', async () => {
  const packageDirectory = await createPackage();

  registryStatuses.delete('/twenty-sdk/2.45.0');
  await assertFailure(
    checkPublishReadiness({ packageDirectory, registryUrl }),
    /^app init would pin versions that are not on npm: twenty-sdk@2\.45\.0\./,
  );
});

await testPublishCheck(
  'reports registry errors apart from missing versions',
  async () => {
    const packageDirectory = await createPackage();

    registryStatuses.set('/twenty-ui/2.45.0', 500);
    await assertFailure(
      checkPublishReadiness({ packageDirectory, registryUrl }),
      /^Could not verify these versions on http:\/\/127\.0\.0\.1:\d+: twenty-ui@2\.45\.0 \(HTTP 500\)/,
    );

    await assertFailure(
      checkPublishReadiness({
        packageDirectory,
        registryUrl: 'http://127.0.0.1:1',
      }),
      /^Could not verify these versions on http:\/\/127\.0\.0\.1:1: twenty-client-sdk@2\.45\.0 \(.+\)/,
    );
  },
);

await new Promise((resolve) => registry.close(resolve));
