import { randomBytes } from 'crypto';
import { createWriteStream, promises as fs } from 'fs';
import { join, resolve } from 'path';

import archiver from 'archiver';
import { pipeline } from 'stream/promises';

const YARN_INSTALL_TIMEOUT_MS = 240_000;
const YARN_ENGINE_DIR = resolve('yarn-engine');
const YARN_ENGINE_PATH = join(YARN_ENGINE_DIR, '.yarn/releases/yarn-4.9.2.cjs');
// A Lambda function and all its layers must stay under 250MB unzipped; the
// budget leaves room for the executor code and the SDK layer.
const MAX_UNZIPPED_DEPENDENCIES_MB = 200;

// The class name is reported as the invocation errorType and matched by
// DEPENDENCIES_SIZE_EXCEEDED_ERROR_NAME on the server.
class DependenciesSizeExceededError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DependenciesSizeExceededError';
  }
}

const writePackageFiles = async (nodejsDir, packageJson, yarnLock) => {
  await fs.mkdir(nodejsDir, { recursive: true });
  await Promise.all([
    fs.writeFile(join(nodejsDir, 'package.json'), packageJson, 'utf-8'),
    fs.writeFile(join(nodejsDir, 'yarn.lock'), yarnLock, 'utf-8'),
  ]);
};

const copyYarnEngine = async (nodejsDir) => {
  await fs.cp('yarn-engine', nodejsDir, { recursive: true });
};

const runYarnInstall = async (nodejsDir) => {
  const { execFile } = await import('child_process');
  const { promisify } = await import('util');
  const execFilePromise = promisify(execFile);

  const { NODE_OPTIONS: _nodeOptions, ...cleanEnv } = process.env;

  // Lambda runs as a sandboxed user whose $HOME doesn't exist.
  // Yarn needs a writable HOME for its global cache/config.
  cleanEnv.HOME = '/tmp';

  try {
    await execFilePromise(
      process.execPath,
      [YARN_ENGINE_PATH, 'workspaces', 'focus', '--all', '--production'],
      {
        cwd: nodejsDir,
        env: cleanEnv,
        timeout: YARN_INSTALL_TIMEOUT_MS,
      },
    );
  } catch (error) {
    const details = [error?.stdout, error?.stderr].filter(Boolean).join('\n');

    throw new Error(`yarn install failed: ${details || error?.message}`);
  }

  // Remove everything except node_modules
  const entries = await fs.readdir(nodejsDir);

  await Promise.all(
    entries
      .filter((entry) => entry !== 'node_modules')
      .map(async (entry) => {
        const fullPath = join(nodejsDir, entry);
        const stat = await fs.stat(fullPath);

        return stat.isDirectory()
          ? fs.rm(fullPath, { recursive: true, force: true })
          : fs.rm(fullPath);
      }),
  );
};

const computeDirectorySizeBytes = async (directory) => {
  const entries = await fs.readdir(directory, { withFileTypes: true });

  const sizes = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(directory, entry.name);

      if (entry.isDirectory()) {
        return computeDirectorySizeBytes(fullPath);
      }

      // Count symlinked file targets (e.g. node_modules/.bin entries) but do
      // not recurse into symlinked directories to avoid cycles.
      if (entry.isSymbolicLink()) {
        try {
          const targetStat = await fs.stat(fullPath);

          return targetStat.isFile() ? targetStat.size : 0;
        } catch {
          return 0;
        }
      }

      if (!entry.isFile()) {
        return 0;
      }

      const stat = await fs.stat(fullPath);

      return stat.size;
    }),
  );

  return sizes.reduce((total, size) => total + size, 0);
};

const assertDependenciesSizeWithinLimit = async (buildDir, maxSizeMb) => {
  const effectiveMaxSizeMb =
    Number.isFinite(maxSizeMb) && maxSizeMb > 0
      ? maxSizeMb
      : MAX_UNZIPPED_DEPENDENCIES_MB;
  const sizeBytes = await computeDirectorySizeBytes(buildDir);
  const sizeMb = Math.ceil(sizeBytes / (1024 * 1024));

  if (sizeMb > effectiveMaxSizeMb) {
    throw new DependenciesSizeExceededError(
      `Dependencies size exceeded: production dependencies unpack to ${sizeMb}MB, the maximum is ${effectiveMaxSizeMb}MB. Move packages that are not imported by your logic functions (UI libraries, dev tooling) out of "dependencies".`,
    );
  }
};

const createZip = async (buildDir, zipPath) => {
  const output = createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  const p = pipeline(archive, output);

  archive.directory(buildDir, false);
  void archive.finalize();

  return p;
};

const uploadToPresignedUrl = async (zipPath, presignedUploadUrl) => {
  const zipBuffer = await fs.readFile(zipPath);

  const response = await fetch(presignedUploadUrl, {
    method: 'PUT',
    body: zipBuffer,
    headers: { 'Content-Type': 'application/zip' },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to upload zip to S3: ${response.status} ${response.statusText}`,
    );
  }
};

export const handler = async (event) => {
  const { action, packageJson, yarnLock, presignedUploadUrl, maxUnzippedSizeMb } =
    event;

  if (action !== 'createLayer') {
    throw new Error(`Unknown action: ${action}`);
  }

  if (!packageJson || !yarnLock) {
    throw new Error('Missing required fields: packageJson, yarnLock');
  }

  if (!presignedUploadUrl) {
    throw new Error('Missing required field: presignedUploadUrl');
  }

  const randomId = randomBytes(16).toString('hex');
  const buildDir = `/tmp/${randomId}`;
  const nodejsDir = join(buildDir, 'nodejs');
  const zipPath = `/tmp/${randomId}.zip`;

  try {
    await writePackageFiles(nodejsDir, packageJson, yarnLock);
    await copyYarnEngine(nodejsDir);
    await runYarnInstall(nodejsDir);
    await assertDependenciesSizeWithinLimit(buildDir, maxUnzippedSizeMb);
    await createZip(buildDir, zipPath);

    await uploadToPresignedUrl(zipPath, presignedUploadUrl);

    return { success: true };
  } finally {
    await fs.rm(buildDir, { recursive: true, force: true });
    await fs.rm(zipPath, { force: true });
    await fs.rm(join(YARN_ENGINE_DIR, '.yarn/cache'), {
      recursive: true,
      force: true,
    });
  }
};
