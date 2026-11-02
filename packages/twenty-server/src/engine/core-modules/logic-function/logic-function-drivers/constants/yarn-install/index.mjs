import { randomBytes } from 'crypto';
import { createWriteStream, promises as fs } from 'fs';
import { join, resolve } from 'path';

import archiver from 'archiver';
import { pipeline } from 'stream/promises';
import { installYarnDependencies } from './yarn-engine/install-yarn-dependencies.cjs';

const YARN_INSTALL_TIMEOUT_MS = 240_000;
const YARN_ENGINE_DIR = resolve('yarn-engine');

const writePackageFiles = async (nodejsDir, packageJson, yarnLock) => {
  await fs.mkdir(nodejsDir, { recursive: true });
  await Promise.all([
    fs.writeFile(join(nodejsDir, 'package.json'), packageJson, 'utf-8'),
    fs.writeFile(join(nodejsDir, 'yarn.lock'), yarnLock, 'utf-8'),
  ]);
};

const runYarnInstall = async (nodejsDir) => {
  try {
    await installYarnDependencies({
      directory: nodejsDir,
      yarnEngineDirectory: YARN_ENGINE_DIR,
      args: ['workspaces', 'focus', '--all', '--production'],
      // The Lambda user's HOME does not exist.
      env: { HOME: '/tmp' },
      timeout: YARN_INSTALL_TIMEOUT_MS,
    });
  } catch (error) {
    const details = [error?.stdout, error?.stderr].filter(Boolean).join('\n');

    throw new Error(`yarn install failed: ${details || error?.message}`);
  }

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
  const { action, packageJson, yarnLock, presignedUploadUrl } = event;

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
    await runYarnInstall(nodejsDir);
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
