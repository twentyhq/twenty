import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PACKAGE_DIRECTORY = fileURLToPath(new URL('..', import.meta.url));
const DIST_DIRECTORY = join(PACKAGE_DIRECTORY, 'dist');
const NPM_REGISTRY_URL = 'https://registry.npmjs.org';
const REGISTRY_TIMEOUT_MILLISECONDS = 15_000;
const COMMAND_TIMEOUT_MILLISECONDS = 60_000;
const SHEBANG = '#!/usr/bin/env node';
const PACKAGE_NAME_PATTERN = /^[a-z0-9][a-z0-9._-]*$/;
const EXACT_VERSION_PATTERN = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;
const RELATIVE_REQUIRE_PATTERN = /require\(["'`](\.{1,2}\/[^"'`]+)["'`]\)/g;
const REQUIRED_FILES = ['dist/app-worker.cjs'];
const COPIED_DIRECTORIES = [
  {
    source: '../create-twenty-app/src/constants/template',
    target: 'dist/app-template',
  },
  { source: 'app-template-overlay', target: 'dist/app-template-overlay' },
];
const RENDERED_APP_FILES = [
  'package.json',
  'tsconfig.json',
  '.yarnrc.yml',
  'src/application-config.ts',
  'src/__tests__/run-twenty.ts',
];
const BUILD_HINT = 'Build it first with: yarn nx build twenty-cli';

class PublishCheckError extends Error {}

const fail = (message) => {
  throw new PublishCheckError(message);
};

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));

const getFileSize = async (path) => {
  const file = await stat(path).catch(() => undefined);

  return file?.isFile() === true ? file.size : undefined;
};

const checkExecutable = async (executable) => {
  const file = await stat(join(PACKAGE_DIRECTORY, executable)).catch(
    () => undefined,
  );

  if (file?.isFile() !== true) {
    fail(`${executable} is missing. ${BUILD_HINT}`);
  }

  if ((file.mode & 0o111) === 0) {
    fail(`${executable} is not executable. ${BUILD_HINT}`);
  }

  const [firstLine] = (
    await readFile(join(PACKAGE_DIRECTORY, executable), 'utf8')
  ).split('\n', 1);

  if (firstLine !== SHEBANG) {
    fail(`${executable} does not start with "${SHEBANG}".`);
  }
};

const checkRequiredFiles = async () => {
  for (const requiredFile of REQUIRED_FILES) {
    const size = await getFileSize(join(PACKAGE_DIRECTORY, requiredFile));

    if (size === undefined || size === 0) {
      fail(`${requiredFile} is missing or empty. ${BUILD_HINT}`);
    }
  }
};

const listFiles = async (directory) => {
  const entries = await readdir(directory, {
    withFileTypes: true,
    recursive: true,
  });

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => relative(directory, join(entry.parentPath, entry.name)));
};

const checkCopiedDirectories = async () => {
  let fileCount = 0;

  for (const { source, target } of COPIED_DIRECTORIES) {
    const sourceFiles = await listFiles(join(PACKAGE_DIRECTORY, source)).catch(
      () => [],
    );

    if (sourceFiles.length === 0) {
      fail(`${source} is missing. Run this check from a repository checkout.`);
    }

    for (const file of sourceFiles) {
      const copied = await readFile(
        join(PACKAGE_DIRECTORY, target, file),
      ).catch(() => undefined);

      if (copied === undefined) {
        fail(`${target}/${file} is missing. ${BUILD_HINT}`);
      }

      if (
        !copied.equals(await readFile(join(PACKAGE_DIRECTORY, source, file)))
      ) {
        fail(`${target}/${file} differs from ${source}/${file}. ${BUILD_HINT}`);
      }
    }

    fileCount += sourceFiles.length;
  }

  return fileCount;
};

const listBundleFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory() && entry.name === 'chunks')
      .map((entry) => listBundleFiles(join(directory, entry.name))),
  );

  return [
    ...entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.cjs'))
      .map((entry) => join(directory, entry.name)),
    ...nested.flat(),
  ];
};

const checkBundleReferences = async () => {
  const bundleFiles = await listBundleFiles(DIST_DIRECTORY);

  for (const bundleFile of bundleFiles) {
    const source = await readFile(bundleFile, 'utf8');

    for (const [, specifier] of source.matchAll(RELATIVE_REQUIRE_PATTERN)) {
      const target = resolve(dirname(bundleFile), specifier);

      if ((await getFileSize(target)) === undefined) {
        fail(
          `${relative(PACKAGE_DIRECTORY, bundleFile)} requires ${specifier}, which is missing. ${BUILD_HINT}`,
        );
      }
    }
  }

  return bundleFiles.length;
};

const parseResult = (output) => {
  try {
    return JSON.parse(output);
  } catch {
    return undefined;
  }
};

const describeExit = (error) => {
  if (error.code === 'ETIMEDOUT') {
    return `timed out after ${COMMAND_TIMEOUT_MILLISECONDS / 1000}s`;
  }

  return typeof error.signal === 'string'
    ? `was stopped by ${error.signal}`
    : `exited with code ${error.status}`;
};

const describeError = (result) =>
  typeof result?.error?.code === 'string'
    ? `: ${result.error.code} ${result.error.message}`
    : ` without an error result. ${BUILD_HINT}`;

const runCli = ({ executable, commandArguments, workingDirectory, home }) => {
  const command = `twenty ${commandArguments.join(' ')}`;
  const environment = Object.fromEntries(
    Object.entries(process.env).filter(([name]) => !name.startsWith('TWENTY_')),
  );
  let output;

  try {
    output = execFileSync(
      process.execPath,
      [join(PACKAGE_DIRECTORY, executable), ...commandArguments, '--json'],
      {
        cwd: workingDirectory,
        env: { ...environment, HOME: home, USERPROFILE: home, NO_COLOR: '1' },
        encoding: 'utf8',
        timeout: COMMAND_TIMEOUT_MILLISECONDS,
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );
  } catch (error) {
    fail(
      `${command} ${describeExit(error)}${describeError(parseResult(error.stdout))}`,
    );
  }

  const result = parseResult(output);

  if (result?.ok !== true) {
    fail(`${command} did not report success${describeError(result)}`);
  }

  return result.data;
};

const checkBuiltVersion = ({ executable, version, home }) => {
  const data = runCli({
    executable,
    commandArguments: ['version'],
    workingDirectory: home,
    home,
  });

  if (data.version !== version) {
    fail(
      `dist was built as version ${data.version}, but package.json is ${version}. ${BUILD_HINT}`,
    );
  }
};

const readTemplatePins = async ({ executable, home }) => {
  const appName = 'publish-check-app';
  const data = runCli({
    executable,
    commandArguments: ['app', 'init', appName, '--no-input'],
    workingDirectory: home,
    home,
  });
  const appDirectory = join(home, appName);

  for (const file of RENDERED_APP_FILES) {
    const size = await getFileSize(join(appDirectory, file));

    if (size === undefined || size === 0) {
      fail(`app init did not create ${file}.`);
    }
  }

  if (
    !(
      await readFile(join(appDirectory, 'src/application-config.ts'), 'utf8')
    ).includes('defineApplication')
  ) {
    fail(
      'app init created src/application-config.ts without defineApplication.',
    );
  }

  const appPackageJson = await readJson(join(appDirectory, 'package.json'));
  const renderedVersions = {
    ...appPackageJson.dependencies,
    ...appPackageJson.devDependencies,
  };

  if (!Array.isArray(data.packages) || data.packages.length === 0) {
    fail('app init did not report the packages it pins.');
  }

  return data.packages.map(({ name, version }) => {
    if (!PACKAGE_NAME_PATTERN.test(name)) {
      fail(`app init reported an unexpected package name: ${name}`);
    }

    if (renderedVersions[name] !== version) {
      fail(
        `app init reported ${name}@${version}, but the generated package.json pins ${renderedVersions[name]}.`,
      );
    }

    if (!EXACT_VERSION_PATTERN.test(version)) {
      fail(`app init pins ${name} to ${version}, not an exact version.`);
    }

    return { name, version };
  });
};

const lookUpPublishedVersion = async ({ name, version }) => {
  try {
    const response = await fetch(`${NPM_REGISTRY_URL}/${name}/${version}`, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(REGISTRY_TIMEOUT_MILLISECONDS),
    });

    if (response.ok) {
      return 'published';
    }

    return response.status === 404 ? 'missing' : `HTTP ${response.status}`;
  } catch (error) {
    return error.message;
  }
};

const checkPinsArePublished = async (pins) => {
  const lookups = await Promise.all(
    pins.map(async (pin) => ({
      ...pin,
      status: await lookUpPublishedVersion(pin),
    })),
  );
  const missing = lookups.filter(({ status }) => status === 'missing');
  const unverified = lookups.filter(
    ({ status }) => status !== 'missing' && status !== 'published',
  );

  if (missing.length > 0) {
    fail(
      `app init would pin versions that are not on npm: ${missing.map(({ name, version }) => `${name}@${version}`).join(', ')}. ` +
        'Publish the matching SDK release first, and tag this CLI release on the same commit as its sdk/v* tag.',
    );
  }

  if (unverified.length > 0) {
    fail(
      `Could not verify these versions on ${NPM_REGISTRY_URL}: ${unverified.map(({ name, version, status }) => `${name}@${version} (${status})`).join(', ')}. ` +
        'Retry once the registry is reachable.',
    );
  }
};

const main = async () => {
  const { bin, version } = await readJson(
    join(PACKAGE_DIRECTORY, 'package.json'),
  );

  if (typeof bin !== 'string') {
    fail('package.json bin must be the path of the twenty executable.');
  }

  await checkExecutable(bin);
  await checkRequiredFiles();

  const templateFileCount = await checkCopiedDirectories();
  const bundleFileCount = await checkBundleReferences();
  const home = await mkdtemp(join(tmpdir(), 'twenty-publish-check-'));

  try {
    checkBuiltVersion({ executable: bin, version, home });

    const pins = await readTemplatePins({ executable: bin, home });

    await checkPinsArePublished(pins);

    console.log(`twenty ${version} is ready to publish:`);
    console.log(
      `  ${bin}, the app worker, ${bundleFileCount} bundle files and ${templateFileCount} template files are present`,
    );
    console.log(
      `  app init pins ${pins.map(({ name, version: pinnedVersion }) => `${name}@${pinnedVersion}`).join(', ')}, all on npm`,
    );
  } finally {
    await rm(home, { recursive: true, force: true });
  }
};

try {
  await main();
} catch (error) {
  if (!(error instanceof PublishCheckError)) {
    throw error;
  }

  console.error(`Publish check failed: ${error.message}`);
  process.exitCode = 1;
}
