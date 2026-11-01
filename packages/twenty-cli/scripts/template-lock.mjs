import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';

export const PUBLIC_REGISTRY = 'https://registry.npmjs.org';

const RELEASE_MINIMAL_AGE_GATE = '3d';
const PIN_PLACEHOLDER = 'TO-BE-GENERATED';
const BUILD_HINT = 'Build it first with: yarn nx build twenty-cli';

export class TemplateLockError extends Error {}

const fail = (message) => {
  throw new TemplateLockError(message);
};

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));

export const buildTemplateManifest = ({ templateManifest, pins }) => {
  const devDependencies = {
    ...templateManifest.devDependencies,
    ...Object.fromEntries(pins.map(({ name, version }) => [name, version])),
  };
  const unpinnedPackages = Object.entries(devDependencies)
    .filter(([, version]) => version === PIN_PLACEHOLDER)
    .map(([name]) => name);

  if (unpinnedPackages.length > 0) {
    fail(`app init did not pin ${unpinnedPackages.join(', ')}.`);
  }

  return { ...templateManifest, devDependencies };
};

export const buildYarnrc = ({ registry, pins }) => {
  const { protocol, hostname } = new URL(registry);

  return [
    'nodeLinker: node-modules',
    'enableTelemetry: false',
    'enableScripts: false',
    `npmRegistryServer: "${registry}"`,
    ...(protocol === 'http:'
      ? ['unsafeHttpWhitelist:', `  - ${hostname}`]
      : []),
    `npmMinimalAgeGate: ${RELEASE_MINIMAL_AGE_GATE}`,
    'npmPreapprovedPackages:',
    ...pins.map(({ name, version }) => `  - "${name}@${version}"`),
    '',
  ].join('\n');
};

export const resolveYarnBinary = async ({
  repositoryDirectory,
  packageManager,
}) => {
  const yarnrc = await readFile(
    join(repositoryDirectory, '.yarnrc.yml'),
    'utf8',
  );
  const yarnPath = /^yarnPath:\s*(.+)$/m.exec(yarnrc)?.[1]?.trim();

  if (yarnPath === undefined) {
    fail('The repository .yarnrc.yml has no yarnPath.');
  }

  const repositoryYarnVersion = /yarn-(.+)\.cjs$/.exec(basename(yarnPath))?.[1];
  const templateYarnVersion = packageManager?.replace(/^yarn@/, '');

  if (repositoryYarnVersion !== templateYarnVersion) {
    fail(
      `The app template pins yarn@${templateYarnVersion}, but the repository runs yarn ${repositoryYarnVersion}. Align them before generating the lockfile.`,
    );
  }

  return join(repositoryDirectory, yarnPath);
};

export const assertResolvedWithIntegrity = ({
  lockfile,
  packageName,
  version,
}) => {
  const resolution = `resolution: "${packageName}@npm:${version}"`;
  const resolutionIndex = lockfile.indexOf(resolution);

  if (resolutionIndex === -1) {
    fail(
      `${packageName}@${version} is missing from the generated lockfile. Is it published?`,
    );
  }

  const entryEnd = lockfile.indexOf('\n\n', resolutionIndex);
  const entry = lockfile.slice(
    resolutionIndex,
    entryEnd === -1 ? undefined : entryEnd,
  );

  if (!entry.includes('checksum:')) {
    fail(`${packageName}@${version} resolved without an integrity checksum.`);
  }
};

export const assertNoRegistryPinning = (lockfile) => {
  if (lockfile.includes('__archiveUrl')) {
    fail(
      'The generated lockfile pins entries to a registry host. Generate it against the public registry.',
    );
  }
};

const installWithYarn = async ({ yarnBinary, workingDirectory }) => {
  const environment = Object.fromEntries(
    Object.entries(process.env).filter(([name]) => !name.startsWith('YARN_')),
  );

  execFileSync(
    process.execPath,
    [yarnBinary, 'install', '--mode=update-lockfile'],
    { cwd: workingDirectory, env: environment, stdio: 'inherit' },
  );
};

export const generateTemplateLock = async ({
  packageDirectory,
  pins,
  registry = PUBLIC_REGISTRY,
  install = installWithYarn,
}) => {
  const outputDirectory = join(packageDirectory, 'dist/app-template');
  const outputDirectoryStatus = await stat(outputDirectory).catch(
    () => undefined,
  );

  if (outputDirectoryStatus?.isDirectory() !== true) {
    fail(`dist/app-template is missing. ${BUILD_HINT}`);
  }

  const templateManifest = await readJson(
    join(outputDirectory, 'package.json'),
  );
  const manifest = buildTemplateManifest({ templateManifest, pins });
  const yarnBinary = await resolveYarnBinary({
    repositoryDirectory: join(packageDirectory, '../..'),
    packageManager: templateManifest.packageManager,
  });
  const workingDirectory = await mkdtemp(
    join(tmpdir(), 'twenty-template-lock-'),
  );

  try {
    await writeFile(
      join(workingDirectory, 'package.json'),
      `${JSON.stringify(manifest, null, 2)}\n`,
    );
    await writeFile(
      join(workingDirectory, '.yarnrc.yml'),
      buildYarnrc({ registry, pins }),
    );

    try {
      await install({ yarnBinary, workingDirectory });
    } catch {
      fail(
        `Yarn could not resolve the app template with ${pins.map(({ name, version }) => `${name}@${version}`).join(', ')}. See the Yarn output above.`,
      );
    }

    const lockfile = await readFile(
      join(workingDirectory, 'yarn.lock'),
      'utf8',
    );

    for (const { name, version } of pins) {
      assertResolvedWithIntegrity({ lockfile, packageName: name, version });
    }

    if (registry === PUBLIC_REGISTRY) {
      assertNoRegistryPinning(lockfile);
    }

    await writeFile(join(outputDirectory, 'yarn.lock'), lockfile);

    return {
      resolutionCount: lockfile.match(/^ {2}resolution:/gm)?.length ?? 0,
    };
  } finally {
    await rm(workingDirectory, { recursive: true, force: true });
  }
};
