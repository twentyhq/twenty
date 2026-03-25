import { ConfigService } from '@/cli/utilities/config/config-service';
import {
  checkServerHealth,
  detectLocalServer,
} from '@/cli/utilities/server/detect-local-server';
import { runSafe } from '@/cli/utilities/run-safe';
import { APP_ERROR_CODES, type CommandResult } from '@/cli/types';
import { execSync, spawnSync } from 'node:child_process';

const CONTAINER_NAME = 'twenty-app-dev';
const IMAGE = 'twentycrm/twenty-app-dev:latest';
const DEFAULT_PORT = 2020;

const isContainerRunning = (): boolean => {
  try {
    const result = execSync(
      `docker inspect -f '{{.State.Running}}' ${CONTAINER_NAME}`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] },
    ).trim();

    return result === 'true';
  } catch {
    return false;
  }
};

const getContainerPort = (): number => {
  try {
    const result = execSync(
      `docker inspect -f '{{(index (index .NetworkSettings.Ports "3000/tcp") 0).HostPort}}' ${CONTAINER_NAME}`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] },
    ).trim();

    return parseInt(result, 10) || DEFAULT_PORT;
  } catch {
    return DEFAULT_PORT;
  }
};

const containerExists = (): boolean => {
  try {
    execSync(`docker inspect ${CONTAINER_NAME}`, {
      stdio: ['pipe', 'pipe', 'ignore'],
    });

    return true;
  } catch {
    return false;
  }
};

const checkDockerRunning = (): boolean => {
  try {
    execSync('docker info', { stdio: 'ignore' });

    return true;
  } catch {
    return false;
  }
};

const HEALTH_POLL_INTERVAL_MS = 2000;
const HEALTH_TIMEOUT_MS = 180 * 1000;

const waitForHealthy = async (
  port: number,
): Promise<boolean> => {
  const startTime = Date.now();

  while (Date.now() - startTime < HEALTH_TIMEOUT_MS) {
    if (await checkServerHealth(port)) {
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, HEALTH_POLL_INTERVAL_MS));
  }

  return false;
};

export type ServerStartOptions = {
  port?: number;
  onProgress?: (message: string) => void;
};

export type ServerStartResult = {
  port: number;
  url: string;
};

const innerServerStart = async (
  options: ServerStartOptions = {},
): Promise<CommandResult<ServerStartResult>> => {
  const { onProgress } = options;

  const existingUrl = await detectLocalServer(options.port);

  if (existingUrl) {
    const configService = new ConfigService();

    ConfigService.setActiveRemote('local');
    await configService.setConfig({ apiUrl: existingUrl });

    const port = new URL(existingUrl).port;

    onProgress?.(`Twenty server detected on ${existingUrl}`);

    return { success: true, data: { port: parseInt(port, 10), url: existingUrl } };
  }

  if (options.port) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.BUILD_FAILED,
        message:
          `No Twenty server found on port ${options.port}.\n` +
          'Start your server and run `yarn twenty remote add --local` manually.',
      },
    };
  }

  if (!checkDockerRunning()) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.BUILD_FAILED,
        message:
          'Docker is not running. Please start Docker and try again.',
      },
    };
  }

  if (isContainerRunning()) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.BUILD_FAILED,
        message: 'Container is running but not healthy yet.',
      },
    };
  }

  let port = DEFAULT_PORT;

  if (containerExists()) {
    const existingPort = getContainerPort();

    if (existingPort !== port) {
      onProgress?.(
        `Existing container uses port ${existingPort}. Run 'yarn twenty server reset' first to change ports.`,
      );
    }

    port = existingPort;

    onProgress?.('Starting existing container...');
    execSync(`docker start ${CONTAINER_NAME}`, { stdio: 'ignore' });
  } else {
    onProgress?.('Starting Twenty container...');

    const runResult = spawnSync(
      'docker',
      [
        'run',
        '-d',
        '--name',
        CONTAINER_NAME,
        '-p',
        `${port}:3000`,
        '-v',
        'twenty-app-dev-data:/data/postgres',
        '-v',
        'twenty-app-dev-storage:/app/.local-storage',
        IMAGE,
      ],
      { stdio: 'inherit' },
    );

    if (runResult.status !== 0) {
      return {
        success: false,
        error: {
          code: APP_ERROR_CODES.BUILD_FAILED,
          message: 'Failed to start Twenty container.',
        },
      };
    }
  }

  onProgress?.('Waiting for Twenty to be ready...');

  const healthy = await waitForHealthy(port);

  if (!healthy) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.BUILD_FAILED,
        message:
          'Twenty server did not become healthy in time.\n' +
          "Check: 'yarn twenty server logs'",
      },
    };
  }

  const url = `http://localhost:${port}`;
  const configService = new ConfigService();

  ConfigService.setActiveRemote('local');
  await configService.setConfig({ apiUrl: url });

  onProgress?.(`Server running on ${url}`);

  return { success: true, data: { port, url } };
};

export const serverStart = (
  options?: ServerStartOptions,
): Promise<CommandResult<ServerStartResult>> =>
  runSafe(() => innerServerStart(options), APP_ERROR_CODES.BUILD_FAILED);
