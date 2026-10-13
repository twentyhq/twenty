import { strict as assert } from 'node:assert';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  buildTemplateManifest,
  buildYarnrc,
  generateTemplateLock,
  PUBLIC_REGISTRY,
  TemplateLockError,
} from './template-lock.mjs';

const VERSION = '2.45.0';
const FIRST_PARTY_PACKAGES = ['twenty-client-sdk', 'twenty-sdk', 'twenty-ui'];
const TEMPLATE_MANIFEST = {
  name: 'TO-BE-GENERATED',
  packageManager: 'yarn@4.13.0',
  devDependencies: {
    typescript: '^5.9.3',
    ...Object.fromEntries(
      FIRST_PARTY_PACKAGES.map((name) => [name, 'TO-BE-GENERATED']),
    ),
  },
};

const lockfileEntry = (name, { checksum = true } = {}) =>
  [
    `"${name}@npm:${VERSION}":`,
    `  version: ${VERSION}`,
    `  resolution: "${name}@npm:${VERSION}"`,
    ...(checksum ? ['  checksum: 10c0/abc'] : []),
    '  languageName: node',
    '  linkType: hard',
  ].join('\n');

const createRepository = async ({
  yarnVersion = '4.13.0',
  hasBuild = true,
} = {}) => {
  const root = await mkdtemp(join(tmpdir(), 'twenty-template-lock-test-'));
  const packageDirectory = join(root, 'packages/twenty-cli');

  await mkdir(join(packageDirectory, 'app-template'), { recursive: true });
  await mkdir(join(root, 'packages/twenty-sdk'), { recursive: true });
  await writeFile(
    join(root, '.yarnrc.yml'),
    `yarnPath: .yarn/releases/yarn-${yarnVersion}.cjs\n`,
  );
  await writeFile(
    join(packageDirectory, 'app-template/package.json'),
    JSON.stringify(TEMPLATE_MANIFEST),
  );
  await writeFile(
    join(root, 'packages/twenty-sdk/package.json'),
    JSON.stringify({ name: 'twenty-sdk', version: VERSION }),
  );

  if (hasBuild) {
    await mkdir(join(packageDirectory, 'dist/app-template'), {
      recursive: true,
    });
  }

  return { root, packageDirectory };
};

const writeLockfile =
  (content) =>
  ({ workingDirectory }) =>
    writeFile(join(workingDirectory, 'yarn.lock'), content);

const testWithRepository = (name, options, run) =>
  test(name, async () => {
    const repository = await createRepository(options);

    try {
      await run(repository);
    } finally {
      await rm(repository.root, { recursive: true, force: true });
    }
  });

const assertFailure = (promise, pattern) =>
  assert.rejects(promise, (error) => {
    assert.ok(error instanceof TemplateLockError, error);
    assert.match(error.message, pattern);

    return true;
  });

await test('pins only the first-party placeholders of the app template', () => {
  const { manifest, firstPartyPackages } = buildTemplateManifest({
    templateManifest: TEMPLATE_MANIFEST,
    version: VERSION,
  });

  assert.deepEqual(firstPartyPackages, FIRST_PARTY_PACKAGES);
  assert.equal(manifest.name, 'TO-BE-GENERATED');
  assert.deepEqual(manifest.devDependencies, {
    typescript: '^5.9.3',
    'twenty-client-sdk': VERSION,
    'twenty-sdk': VERSION,
    'twenty-ui': VERSION,
  });
});

await test('resolves under an age gate that preapproves only the pinned packages', () => {
  const yarnrc = buildYarnrc({
    registry: PUBLIC_REGISTRY,
    version: VERSION,
    firstPartyPackages: FIRST_PARTY_PACKAGES,
  });

  assert.match(yarnrc, /^npmMinimalAgeGate: 3d$/m);
  assert.match(yarnrc, /^enableScripts: false$/m);
  assert.match(yarnrc, /^ {2}- "twenty-sdk@2\.45\.0"$/m);
  assert.doesNotMatch(yarnrc, /unsafeHttpWhitelist/);
  assert.match(
    buildYarnrc({
      registry: 'http://127.0.0.1:4873',
      version: VERSION,
      firstPartyPackages: FIRST_PARTY_PACKAGES,
    }),
    /^unsafeHttpWhitelist:\n {2}- 127\.0\.0\.1$/m,
  );
});

await testWithRepository(
  'writes the generated lockfile into the built template',
  {},
  async ({ packageDirectory }) => {
    const lockfile = `${FIRST_PARTY_PACKAGES.map((name) => lockfileEntry(name)).join('\n\n')}\n`;

    assert.deepEqual(
      await generateTemplateLock({
        packageDirectory,
        install: writeLockfile(lockfile),
      }),
      {
        version: VERSION,
        firstPartyPackages: FIRST_PARTY_PACKAGES,
        resolutionCount: 3,
      },
    );
    assert.equal(
      await readFile(
        join(packageDirectory, 'dist/app-template/yarn.lock'),
        'utf8',
      ),
      lockfile,
    );
  },
);

await testWithRepository(
  'refuses a pinned package that did not resolve with a checksum',
  {},
  async ({ packageDirectory }) => {
    await assertFailure(
      generateTemplateLock({
        packageDirectory,
        install: writeLockfile(lockfileEntry('twenty-sdk')),
      }),
      /^twenty-client-sdk@2\.45\.0 is missing from the generated lockfile/,
    );
    await assertFailure(
      generateTemplateLock({
        packageDirectory,
        install: writeLockfile(
          FIRST_PARTY_PACKAGES.map((name) =>
            lockfileEntry(name, { checksum: name !== 'twenty-ui' }),
          ).join('\n\n'),
        ),
      }),
      /^twenty-ui@2\.45\.0 resolved without an integrity checksum/,
    );
  },
);

await testWithRepository(
  'refuses entries pinned to a registry host',
  {},
  async ({ packageDirectory }) => {
    await assertFailure(
      generateTemplateLock({
        packageDirectory,
        install: writeLockfile(
          `${FIRST_PARTY_PACKAGES.map((name) => lockfileEntry(name)).join('\n\n')}\n  __archiveUrl: https://mirror.example.com\n`,
        ),
      }),
      /pins entries to a registry host/,
    );
  },
);

await testWithRepository(
  'reports a failed resolution',
  {},
  async ({ packageDirectory }) => {
    await assertFailure(
      generateTemplateLock({
        packageDirectory,
        install: () => {
          throw new Error('YN0082: No candidates found');
        },
      }),
      /^Yarn could not resolve the app template with twenty-client-sdk, twenty-sdk, twenty-ui at 2\.45\.0/,
    );
  },
);

await testWithRepository(
  'refuses a template whose Yarn differs from the repository',
  { yarnVersion: '4.12.0' },
  async ({ packageDirectory }) => {
    await assertFailure(
      generateTemplateLock({
        packageDirectory,
        install: writeLockfile(''),
      }),
      /pins yarn@4\.13\.0, but the repository runs yarn 4\.12\.0/,
    );
  },
);

await testWithRepository(
  'needs a built template',
  { hasBuild: false },
  async ({ packageDirectory }) => {
    await assertFailure(
      generateTemplateLock({
        packageDirectory,
        install: writeLockfile(''),
      }),
      /^dist\/app-template is missing/,
    );
  },
);
