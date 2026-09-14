// Generates the yarn.lock shipped inside the scaffold template.
//
// Without it, a generated project resolves every dependency from scratch on its
// first install, which fails outright when the user's package manager enforces a
// minimum release age (Yarn's npmMinimalAgeGate, pnpm's minimumReleaseAge, npm's
// min-release-age): the first-party packages are only minutes old at that point,
// and an exact pin leaves the resolver no older candidate to fall back to. A
// lockfile removes the resolution step entirely, so the gate never applies — and
// unlike loosening the pins or disabling the gate, it leaves the user's policy
// in force for every dependency they add later.
//
// Run this AFTER `nx build create-twenty-app` and AFTER the libraries are live on
// the registry, then publish; the publish workflow in twentyhq/twenty-infra runs
// it in that order.
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

// Matches the monorepo's own npmMinimalAgeGate. Stated explicitly because nothing
// is inherited here: the lockfile is resolved in a temp directory outside the
// repo, with YARN_* stripped, so the effective gate would otherwise be zero.
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

// The generated project runs the Yarn its package.json pins. Generating the
// lockfile with a different Yarn can produce a lockfile that release pins reject
// with YN0028 on the user's first CI run, so refuse to guess.
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
    // Yarn refuses plain HTTP unless the host is whitelisted by name, so take it
    // from the registry rather than assuming localhost.
    ...(protocol === 'http:'
      ? ['unsafeHttpWhitelist:', `  - ${hostname}`]
      : []),
    // Scaffolded projects install this lockfile without re-resolving, which is
    // exactly what lets them satisfy a consumer's age gate -- and equally what
    // stops that gate from ever inspecting these versions. This resolution is
    // therefore the only point at which an age gate applies to the tree a
    // generated project receives, so hold one here, and waive it for nothing
    // beyond the exact first-party versions this release is publishing.
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
  // Entry keys merge when several descriptors share one resolution
  // ("pkg@npm:1.0.0, pkg@npm:^1.0.0":), so match the resolution line instead.
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

// A registry serving tarballs from non-conventional URLs makes Yarn pin each
// entry to that exact host via __archiveUrl, which would not resolve for anyone
// else. Only the public registry produces a lockfile we can ship.
const assertNoRegistryPinning = ({
  lockfile,
  registry,
}: {
  lockfile: string;
  registry: string;
}) => {
  if (registry !== PUBLIC_REGISTRY) {
    // The release workflow always regenerates against the public registry right
    // before publishing, so a lockfile built here is only ever local scaffolding.
    // Say so out loud rather than passing silently.
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

    // YARN_* variables outrank the .yarnrc.yml written above, so a registry or
    // gate exported by the surrounding CI job would silently change the result.
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
