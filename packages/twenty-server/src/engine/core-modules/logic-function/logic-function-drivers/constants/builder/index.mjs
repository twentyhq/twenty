import { execFile } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';
import { promisify } from 'util';

import {
  LambdaClient,
  PublishLayerVersionCommand,
} from '@aws-sdk/client-lambda';

const execFilePromise = promisify(execFile);
const lambdaClient = new LambdaClient({});

const BUILD_DIR = '/tmp/layer';
const NODEJS_DIR = join(BUILD_DIR, 'nodejs');
const ZIP_PATH = '/tmp/layer.zip';
const YARN_INSTALL_TIMEOUT_MS = 240_000;

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
  // The yarn engine is bundled alongside this handler in the Lambda zip
  const yarnEngineDir = join(import.meta.dirname, 'yarn-engine');

  await fs.cp(yarnEngineDir, NODEJS_DIR, { recursive: true });
};

const runYarnInstall = async () => {
  const localYarnPath = join(NODEJS_DIR, '.yarn/releases/yarn-4.9.2.cjs');

  // oxlint-disable-next-line no-undef
  const { NODE_OPTIONS: _nodeOptions, ...cleanEnv } = process.env;

  await execFilePromise(
    // oxlint-disable-next-line no-undef
    process.execPath,
    [localYarnPath, 'workspaces', 'focus', '--all', '--production'],
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
  await execFilePromise('zip', ['-r', ZIP_PATH, '.'], {
    cwd: BUILD_DIR,
  });
};

const publishLayer = async (layerName, compatibleRuntimes) => {
  const zipBuffer = await fs.readFile(ZIP_PATH);

  const result = await lambdaClient.send(
    new PublishLayerVersionCommand({
      LayerName: layerName,
      Content: { ZipFile: zipBuffer },
      CompatibleRuntimes: compatibleRuntimes,
    }),
  );

  if (!result.LayerVersionArn) {
    throw new Error('PublishLayerVersion did not return a LayerVersionArn');
  }

  return result.LayerVersionArn;
};

export const handler = async (event) => {
  const { action, layerName, packageJson, yarnLock, compatibleRuntimes } =
    event;

  if (action !== 'createLayer') {
    throw new Error(`Unknown action: ${action}`);
  }

  if (!layerName || !packageJson || !yarnLock) {
    throw new Error(
      'Missing required fields: layerName, packageJson, yarnLock',
    );
  }

  await cleanTmp();

  await writePackageFiles(packageJson, yarnLock);
  await copyYarnEngine();
  await runYarnInstall();
  await createZip();

  const layerVersionArn = await publishLayer(
    layerName,
    compatibleRuntimes ?? ['nodejs18.x', 'nodejs22.x'],
  );

  await cleanTmp();

  return { layerVersionArn };
};
