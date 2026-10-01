// Ships a yarn.lock in the template so the first install skips resolution, which minimum-release-age gates
// reject for minutes-old first-party packages. Run after `nx build create-twenty-app` and once the libraries are live.
import { execFileSync } from 'child_process';
import * as fs from 'fs-extra';
import { tmpdir } from 'os';
import { basename, dirname, join, resolve } from 'path';

import { isDefined } from 'twenty-shared/utils';

import { TEMPLATE_FIRST_PARTY_PACKAGES } from '@/constants/template-packages';
import createTwentyAppPackageJson from 'package.json';

const PACKAGE_ROOT = resolve(__dirname, '..', '..');
const REPO_ROOT = resolve(PACKAGE_ROOT, '..', '..');
const TEMPLATE_MANIFEST_PATH = join(
  PACKAGE_ROOT,
  'src/constants/template/package.json',
);
const DEFAULT_OUTPUT_PATH = join(
  PACKAGE_ROOT,
  'dist/constants/template/yarn.lock',
);
const PUBLIC_REGISTRY = 'https://registry.npmjs.org';

// Matches the monorepo's npmMinimalAgeGate; stated explicitly since resolution runs outside the repo with YARN_* stripped.
const RELEASE_MINIMAL_AGE_GATE = '3d';

type Options = {
  version: string;
  registry: string;
  outputPath: string;
};

const parseOptions = (argv: string[]): Options => {
  const read = (name: string) => {
    const prefix = `--${name}=`;
    const flag = argv.find((argument) => argument.startsWith(prefix));
    const value = flag?.slice(prefix.length);

    // nx interpolates an unsupplied {args.foo} to an empty string.
    return value === '' ? undefined : value;
  };

  return {
    version: read('version') ?? createTwentyAppPackageJson.version,
    registry: (read('registry') ?? PUBLIC_REGISTRY).replace(/\/$/, ''),
    outputPath: read('out') ?? DEFAULT_OUTPUT_PATH,
  };
};

// A lockfile generated with another Yarn can be rejected with YN0028 by the project's pinned Yarn.
const resolveYarnBinary = (templatePackageManager: string) => {
  const yarnrc = fs.readFileSync(join(REPO_ROOT, '.yarnrc.yml'), 'utf8');
  const yarnPath = /^yarnPath:\s*(.+)$/m.exec(yarnrc)?.[1]?.trim();

  if (!isDefined(yarnPath)) {
    throw new Error('No yarnPath found in the monorepo .yarnrc.yml');
  }

  const repoYarnVersion = /yarn-(.+)\.cjs$/.exec(basename(yarnPath))?.[1];
  const templateYarnVersion = templatePackageManager.replace(/^yarn@/, '');

  if (repoYarnVersion !== templateYarnVersion) {
    throw new Error(
      `The scaffold template pins yarn@${templateYarnVersion} but the monorepo runs yarn ${repoYarnVersion}. ` +
        'Align them before generating the template lockfile.',
    );
  }

  return join(REPO_ROOT, yarnPath);
};

const buildTemplateManifest = (version: string) => {
  const manifest = fs.readJsonSync(TEMPLATE_MANIFEST_PATH);

  for (const packageName of TEMPLATE_FIRST_PARTY_PACKAGES) {
    manifest.devDependencies[packageName] = version;
  }

  return manifest;
};

const buildYarnrc = ({
  registry,
  version,
}: {
  registry: string;
  version: string;
}) => {
  const { protocol, hostname } = new URL(registry);

  return [
    'nodeLinker: node-modules',
    'enableTelemetry: false',
    'enableScripts: false',
    `npmRegistryServer: "${registry}"`,
    // Yarn refuses plain HTTP unless the host is whitelisted by name.
    ...(protocol === 'http:'
      ? ['unsafeHttpWhitelist:', `  - ${hostname}`]
      : []),
    // The shipped lockfile bypasses consumers' age gates, so this resolution is the only place one applies.
    `npmMinimalAgeGate: ${RELEASE_MINIMAL_AGE_GATE}`,
    'npmPreapprovedPackages:',
    ...TEMPLATE_FIRST_PARTY_PACKAGES.map((name) => `  - "${name}@${version}"`),
    '',
  ].join('\n');
};

const assertResolvedWithIntegrity = ({
  lockfile,
  packageName,
  version,
}: {
  lockfile: string;
  packageName: string;
  version: string;
}) => {
  // Entry keys merge when descriptors share a resolution, so match the resolution line instead.
  const resolution = `resolution: "${packageName}@npm:${version}"`;
  const resolutionIndex = lockfile.indexOf(resolution);

  if (resolutionIndex === -1) {
    throw new Error(
      `${packageName}@${version} is missing from the generated lockfile. Is it published yet?`,
    );
  }

  const entryEnd = lockfile.indexOf('\n\n', resolutionIndex);
  const entry = lockfile.slice(
    resolutionIndex,
    entryEnd === -1 ? undefined : entryEnd,
  );

  if (!entry.includes('checksum:')) {
    throw new Error(
      `${packageName}@${version} resolved without an integrity checksum.`,
    );
  }
};

// Non-conventional tarball URLs make Yarn pin entries to that host via __archiveUrl, unresolvable for others.
const assertNoRegistryPinning = ({
  lockfile,
  registry,
}: {
  lockfile: string;
  registry: string;
}) => {
  if (registry !== PUBLIC_REGISTRY) {
    // Only warn: the release workflow always regenerates against the public registry before publishing.
    console.warn(
      `Generated against ${registry}, not ${PUBLIC_REGISTRY}: this lockfile is for local testing and must not be published.`,
    );

    return;
  }

  if (lockfile.includes('__archiveUrl')) {
    throw new Error(
      'The generated lockfile pins entries to a specific registry host. Regenerate it against the public registry.',
    );
  }
};

const generateTemplateLock = async ({
  version,
  registry,
  outputPath,
}: Options) => {
  const manifest = buildTemplateManifest(version);
  const yarnBinary = resolveYarnBinary(manifest.packageManager);
  const workingDirectory = await fs.mkdtemp(
    join(tmpdir(), 'twenty-template-lock-'),
  );

  try {
    await fs.writeJson(join(workingDirectory, 'package.json'), manifest, {
      spaces: 2,
    });
    await fs.writeFile(
      join(workingDirectory, '.yarnrc.yml'),
      buildYarnrc({ registry, version }),
    );

    // YARN_* variables outrank .yarnrc.yml, so a CI job's exports would change the result.
    const environment = Object.fromEntries(
      Object.entries(process.env).filter(([key]) => !key.startsWith('YARN_')),
    );

    execFileSync(
      process.execPath,
      [yarnBinary, 'install', '--mode=update-lockfile'],
      { cwd: workingDirectory, stdio: 'inherit', env: environment },
    );

    const lockfile = await fs.readFile(
      join(workingDirectory, 'yarn.lock'),
      'utf8',
    );

    for (const packageName of TEMPLATE_FIRST_PARTY_PACKAGES) {
      assertResolvedWithIntegrity({ lockfile, packageName, version });
    }

    assertNoRegistryPinning({ lockfile, registry });

    await fs.ensureDir(dirname(outputPath));
    await fs.writeFile(outputPath, lockfile);

    const resolutionCount = lockfile.match(/^ {2}resolution:/gm)?.length ?? 0;

    console.log(
      `Wrote ${outputPath} (${resolutionCount} resolutions, ${TEMPLATE_FIRST_PARTY_PACKAGES.join(', ')} @ ${version})`,
    );
  } finally {
    await fs.remove(workingDirectory);
  }
};

generateTemplateLock(parseOptions(process.argv.slice(2))).catch(
  (error: unknown) => {
    console.error(
      `Failed to generate the template lockfile: ${error instanceof Error ? error.message : error}`,
    );
    process.exit(1);
  },
);
