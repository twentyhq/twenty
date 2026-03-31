import { SERVER_ERROR_CODES, type CommandResult } from '@/cli/types';
import { ConfigService } from '@/cli/utilities/config/config-service';
import { runSafe } from '@/cli/utilities/run-safe';
import {
  checkDockerRunning,
  CONTAINER_NAME,
  containerExists,
  DEFAULT_PORT,
  getContainerPort,
  IMAGE,
  isContainerRunning,
} from '@/cli/utilities/server/docker-container';
import {
  checkServerHealth,
  detectLocalServer,
} from '@/cli/utilities/server/detect-local-server';
import { execSync, spawnSync } from 'node:child_process';

const HEALTH_POLL_INTERVAL_MS = 2000;
const HEALTH_TIMEOUT_MS = 180 * 1000;

const waitForHealthy = async (port: number): Promise<boolean> => {
  const startTime = Date.now();

  while (Date.now() - startTime < HEALTH_TIMEOUT_MS) {
    if (await checkServerHealth(port)) {
      return true;
    }

    await new Promise((resolve) =>
      setTimeout(resolve, HEALTH_POLL_INTERVAL_MS),
    );
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

    return {
      success: true,
      data: { port: parseInt(port, 10), url: existingUrl },
    };
  }

  if (!checkDockerRunning()) {
    return {
      success: false,
      error: {
        code: SERVER_ERROR_CODES.DOCKER_NOT_RUNNING,
        message: 'Docker is not running. Please start Docker and try again.',
      },
    };
  }

  if (isContainerRunning()) {
    const port = getContainerPort();

    onProgress?.('Container is running, waiting for it to become healthy...');

    const healthy = await waitForHealthy(port);

    if (!healthy) {
      return {
        success: false,
        error: {
          code: SERVER_ERROR_CODES.HEALTH_TIMEOUT,
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
  }

  let port = options.port ?? DEFAULT_PORT;

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

    const serverUrl = `http://localhost:${port}`;

    const runResult = spawnSync(
      'docker',
      [
        'run',
        '-d',
        '--name',
        CONTAINER_NAME,
        '-e',
        `SERVER_URL=${serverUrl}`,
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
          code: SERVER_ERROR_CODES.CONTAINER_START_FAILED,
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
        code: SERVER_ERROR_CODES.HEALTH_TIMEOUT,
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
  runSafe(
    () => innerServerStart(options),
    SERVER_ERROR_CODES.CONTAINER_START_FAILED,
  );
