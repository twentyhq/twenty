import { SERVER_ERROR_CODES, type CommandResult } from '@/cli/types';
import { ConfigService } from '@/cli/utilities/config/config-service';
import { getConfigPath } from '@/cli/utilities/config/get-config-path';
import { runSafe } from '@/cli/utilities/run-safe';
import {
  checkDockerRunning,
  CONTAINER_NAME,
  containerExists,
  DEFAULT_PORT,
  DEFAULT_TEST_PORT,
  getContainerPort,
  getDockerNotRunningMessage,
  IMAGE,
  isContainerRunning,
  TEST_CONTAINER_NAME,
} from '@/cli/utilities/server/docker-container';
import {
  checkServerHealth,
  detectLocalServer,
} from '@/cli/utilities/server/detect-local-server';
import { execSync, spawn, spawnSync } from 'node:child_process';
import chalk from 'chalk';

const HEALTH_POLL_INTERVAL_MS = 2000;
const HEALTH_TIMEOUT_MS = 180 * 1000;
const MILESTONE_START = '==> START ';
const MILESTONE_DONE = '==> DONE';

const waitForHealthy = async (
  port: number,
  containerName: string,
): Promise<boolean> => {
  const startTime = Date.now();
  const onProgress = (message: string) =>
    process.stdout.write(chalk.gray(message));

  const logStream = spawn(
    'docker',
    ['logs', '-f', '--since', '1s', containerName],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  );

  logStream.on('error', () => {});

  let hasPendingStep = false;

  const handleLogLine = (line: string) => {
    const trimmed = line.trim();
    const startIndex = trimmed.indexOf(MILESTONE_START);
    const doneIndex = trimmed.indexOf(MILESTONE_DONE);

    if (startIndex !== -1) {
      if (hasPendingStep) {
        onProgress('Done\n');
      }

      const message = trimmed.slice(startIndex + MILESTONE_START.length);

      onProgress(`==>  ${message}... `);
      hasPendingStep = true;
    } else if (doneIndex !== -1 && hasPendingStep) {
      onProgress('Done\n');
      hasPendingStep = false;
    }
  };

  let logBuffer = '';

  const onData = (chunk: Buffer) => {
    logBuffer += chunk.toString();

    const lines = logBuffer.split('\n');

    logBuffer = lines.pop() ?? '';
    lines.forEach(handleLogLine);
  };

  logStream.stdout?.on('data', onData);
  logStream.stderr?.on('data', onData);

  try {
    while (Date.now() - startTime < HEALTH_TIMEOUT_MS) {
      if (await checkServerHealth(port)) {
        if (hasPendingStep) {
          onProgress('Done\n');
        }

        return true;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, HEALTH_POLL_INTERVAL_MS),
      );
    }

    if (hasPendingStep) {
      onProgress('Failed\n');
    }

    return false;
  } finally {
    logStream.kill();
  }
};

export type ServerStartOptions = {
  port?: number;
  test?: boolean;
  onProgress?: (message: string) => void;
};

export type ServerStartResult = {
  port: number;
  url: string;
};

const innerServerStart = async (
  options: ServerStartOptions = {},
): Promise<CommandResult<ServerStartResult>> => {
  const { onProgress, test: isTest } = options;

  const containerName = isTest ? TEST_CONTAINER_NAME : CONTAINER_NAME;
  const defaultPort = isTest ? DEFAULT_TEST_PORT : DEFAULT_PORT;
  const volumeData = isTest
    ? 'twenty-app-dev-test-data'
    : 'twenty-app-dev-data';
  const volumeStorage = isTest
    ? 'twenty-app-dev-test-storage'
    : 'twenty-app-dev-storage';

  const existingUrl = await detectLocalServer(options.port ?? defaultPort);

  if (existingUrl) {
    const configService = new ConfigService(
      isTest ? { configPath: getConfigPath(true) } : undefined,
    );

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
    const retryCommand = isTest
      ? 'yarn twenty server start --test'
      : 'yarn twenty server start';

    return {
      success: false,
      error: {
        code: SERVER_ERROR_CODES.DOCKER_NOT_RUNNING,
        message: getDockerNotRunningMessage(retryCommand),
      },
    };
  }

  if (isContainerRunning(containerName)) {
    const port = getContainerPort(containerName);

    onProgress?.('Container is running, waiting for it to become healthy...');

    const healthy = await waitForHealthy(port, containerName);

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
    const configService = new ConfigService(
      isTest ? { configPath: getConfigPath(true) } : undefined,
    );

    ConfigService.setActiveRemote('local');
    await configService.setConfig({ apiUrl: url });

    onProgress?.(`Server running on ${url}`);

    return { success: true, data: { port, url } };
  }

  let port = options.port ?? defaultPort;

  if (containerExists(containerName)) {
    const existingPort = getContainerPort(containerName);

    if (existingPort !== port) {
      onProgress?.(
        `Existing container uses port ${existingPort}. Run 'yarn twenty server reset${isTest ? ' --test' : ''}' first to change ports.`,
      );
    }

    port = existingPort;

    onProgress?.('Starting existing container...');
    execSync(`docker start ${containerName}`, { stdio: 'ignore' });
  } else {
    onProgress?.('Starting Twenty container...');

    const runResult = spawnSync(
      'docker',
      [
        'run',
        '-d',
        '--name',
        containerName,
        '-p',
        `${port}:${port}`,
        '-e',
        `NODE_PORT=${port}`,
        '-e',
        `SERVER_URL=http://localhost:${port}`,
        '-v',
        `${volumeData}:/data/postgres`,
        '-v',
        `${volumeStorage}:/app/packages/twenty-server/.local-storage`,
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

  const healthy = await waitForHealthy(port, containerName);

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
  const configService = new ConfigService(
    isTest ? { configPath: getConfigPath(true) } : undefined,
  );

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
