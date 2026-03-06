import { createWriteStream, promises as fs } from 'fs';
import { join } from 'path';

import archiver from 'archiver';
import { pipeline } from 'stream/promises';

const BUILD_DIR = '/tmp/layer';
const NODEJS_DIR = join(BUILD_DIR, 'nodejs');
const ZIP_PATH = '/tmp/layer.zip';
const YARN_INSTALL_TIMEOUT_MS = 240_000;
const YARN_ENGINE_PATH = '.yarn/releases/yarn-4.9.2.cjs';

const cleanTmp = async () => {
  await fs.rm(BUILD_DIR, { recursive: true, force: true });
  await fs.rm(ZIP_PATH, { force: true });
};

const writePackageFiles = async (packageJson, yarnLock) => {
  await fs.mkdir(NODEJS_DIR, { recursive: true });
  await Promise.all([
    fs.writeFile(join(NODEJS_DIR, 'package.json'), packageJson, 'utf-8'),
    fs.writeFile(join(NODEJS_DIR, 'yarn.lock'), yarnLock, 'utf-8'),
  ]);
};

const copyYarnEngine = async () => {
  await fs.cp('yarn-engine', NODEJS_DIR, { recursive: true });
};

const runYarnInstall = async () => {
  const { execFile } = await import('child_process');
  const { promisify } = await import('util');
  const execFilePromise = promisify(execFile);

  const { NODE_OPTIONS: _nodeOptions, ...cleanEnv } = process.env;

  // Lambda runs as a sandboxed user whose $HOME doesn't exist.
  // Yarn needs a writable HOME for its global cache/config.
  cleanEnv.HOME = '/tmp';

  await execFilePromise(
    process.execPath,
    [YARN_ENGINE_PATH, 'workspaces', 'focus', '--all', '--production'],
    {
      cwd: NODEJS_DIR,
      env: cleanEnv,
      timeout: YARN_INSTALL_TIMEOUT_MS,
    },
  );

  // Remove everything except node_modules
  const entries = await fs.readdir(NODEJS_DIR);

  await Promise.all(
    entries
      .filter((entry) => entry !== 'node_modules')
      .map(async (entry) => {
        const fullPath = join(NODEJS_DIR, entry);
        const stat = await fs.stat(fullPath);

        return stat.isDirectory()
          ? fs.rm(fullPath, { recursive: true, force: true })
          : fs.rm(fullPath);
      }),
  );
};

const createZip = async () => {
  const output = createWriteStream(ZIP_PATH);
  const archive = archiver('zip', { zlib: { level: 9 } });

  const p = pipeline(archive, output);

  archive.directory(BUILD_DIR, false);
  archive.finalize();

  return p;
};

const uploadToS3 = async (presignedUploadUrl) => {
  const zipBuffer = await fs.readFile(ZIP_PATH);

  const response = await fetch(presignedUploadUrl, {
    method: 'PUT',
    body: zipBuffer,
    headers: {
      'Content-Type': 'application/zip',
    },
  });

  if (!response.ok) {
    const body = await response.text();

    throw new Error(
      `S3 upload failed: ${response.status} ${response.statusText} - ${body}`,
    );
  }
};

export const handler = async (event) => {
  const { action, packageJson, yarnLock, presignedUploadUrl } = event;

  if (action !== 'createLayer') {
    throw new Error(`Unknown action: ${action}`);
  }

  if (!packageJson || !yarnLock || !presignedUploadUrl) {
    throw new Error(
      'Missing required fields: packageJson, yarnLock, presignedUploadUrl',
    );
  }

  await cleanTmp();

  await writePackageFiles(packageJson, yarnLock);
  await copyYarnEngine();
  await runYarnInstall();
  await createZip();
  await uploadToS3(presignedUploadUrl);

  await cleanTmp();

  return { uploaded: true };
};
