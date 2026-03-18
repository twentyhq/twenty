import chalk from 'chalk';
import {
  type ChildProcess,
  execSync,
  spawn,
  spawnSync,
} from 'node:child_process';
import { platform } from 'node:os';

const CONTAINER_NAME = 'twenty-app-dev';
const IMAGE = 'twentycrm/twenty-app-dev:latest';

const TWENTY_PORTS = [2020, 3000];

const isDockerAvailable = (): boolean => {
  try {
    execSync('docker --version', { stdio: 'ignore' });

    return true;
  } catch {
    return false;
  }
};

const isDockerRunning = (): boolean => {
  try {
    execSync('docker info', { stdio: 'ignore' });

    return true;
  } catch {
    return false;
  }
};

const checkHealthz = async (port: number): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`http://localhost:${port}/healthz`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const body = await response.json();

    return body.status === 'ok';
  } catch {
    return false;
  }
};

const detectRunningServer = async (): Promise<number | null> => {
  for (const port of TWENTY_PORTS) {
    if (await checkHealthz(port)) {
      return port;
    }
  }

  return null;
};

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

const streamDockerLogs = (): ChildProcess => {
  const logProcess = spawn(
    'docker',
    ['logs', '-f', '--tail', '0', CONTAINER_NAME],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  );

  const formatLogLine = (line: string): string | null => {
    if (line.includes('Waiting for PostgreSQL'))
      return 'Starting PostgreSQL...';
    if (line.includes('PostgreSQL is ready')) return 'PostgreSQL ready.';
    if (line.includes('Ready to accept connections tcp')) return 'Redis ready.';
    if (line.includes('running initial setup'))
      return 'Running initial database setup...';
    if (line.includes('database:migrate:prod'))
      return 'Running database migrations...';
    if (line.includes('cache:flush')) return 'Flushing cache...';
    if (line.includes('command:prod upgrade'))
      return 'Running workspace upgrade...';
    if (line.includes('workspace:seed:dev')) return 'Seeding dev workspace...';
    if (line.includes('NestApplication')) return 'Starting Twenty server...';

    return null;
  };

  const handleData = (data: Buffer) => {
    const lines = data.toString().split('\n');

    for (const line of lines) {
      const formatted = formatLogLine(line);

      if (formatted) {
        process.stdout.write(chalk.gray(`  ${formatted}\n`));
      }
    }
  };

  logProcess.stdout?.on('data', handleData);
  logProcess.stderr?.on('data', handleData);

  return logProcess;
};

const waitForHealthy = async ({
  port,
  timeoutSeconds = 120,
}: {
  port: number;
  timeoutSeconds?: number;
}): Promise<boolean> => {
  const startTime = Date.now();
  const timeoutMs = timeoutSeconds * 1000;

  while (Date.now() - startTime < timeoutMs) {
    if (await checkHealthz(port)) {
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  return false;
};

export type LocalInstanceResult = {
  running: boolean;
  serverUrl?: string;
};

export const setupLocalInstance = async (): Promise<LocalInstanceResult> => {
  console.log('');
  console.log(chalk.blue('Setting up local Twenty instance...'));

  // Detect an already-running Twenty server on known ports
  const existingPort = await detectRunningServer();

  if (existingPort) {
    const serverUrl = `http://localhost:${existingPort}`;

    console.log(chalk.green(`Twenty server detected on ${serverUrl}.`));

    return { running: true, serverUrl };
  }

  // No server found — start the Docker container
  if (!isDockerAvailable()) {
    console.log(
      chalk.yellow('Docker is not installed. Please install Docker first.'),
    );
    console.log(chalk.gray('   See https://docs.docker.com/get-docker/'));

    return { running: false };
  }

  if (!isDockerRunning()) {
    console.log(
      chalk.yellow('Docker is not running. Please start Docker and try again.'),
    );

    return { running: false };
  }

  if (isContainerRunning()) {
    console.log(
      chalk.gray('Container exists but server not healthy, restarting...'),
    );
    execSync(`docker restart ${CONTAINER_NAME}`, { stdio: 'ignore' });
  } else {
    spawnSync('docker', ['rm', '-f', CONTAINER_NAME], { stdio: 'ignore' });

    console.log(chalk.gray(`Pulling ${IMAGE}...`));

    try {
      execSync(`docker pull ${IMAGE}`, { stdio: 'inherit' });
    } catch {
      console.log(
        chalk.gray(
          'Pull failed (image may not be published yet), trying local image...',
        ),
      );
    }

    console.log(chalk.gray('Starting Twenty container...'));

    try {
      execSync(
        [
          'docker run -d',
          `--name ${CONTAINER_NAME}`,
          '-p 2020:3000',
          '-v twenty-app-dev-data:/data/postgres',
          '-v twenty-app-dev-storage:/app/.local-storage',
          IMAGE,
        ].join(' '),
        { stdio: 'inherit' },
      );
    } catch {
      console.log(
        chalk.yellow('Failed to start Twenty container. Check Docker logs.'),
      );

      return { running: false };
    }
  }

  console.log(chalk.gray('Waiting for Twenty to be ready...'));

  const logProcess = streamDockerLogs();
  const healthy = await waitForHealthy({ port: 2020, timeoutSeconds: 180 });

  logProcess.kill();

  if (!healthy) {
    console.log(
      chalk.yellow(
        'Twenty server did not become healthy in time. Check: docker logs twenty-app-dev',
      ),
    );

    return { running: false };
  }

  const serverUrl = 'http://localhost:2020';

  console.log(chalk.green(`Twenty server is running on ${serverUrl}.`));
  console.log(
    chalk.gray('Workspace ready — login with tim@apple.dev / tim@apple.dev'),
  );

  const openCommand =
    platform() === 'darwin'
      ? 'open'
      : platform() === 'win32'
        ? 'start'
        : 'xdg-open';

  try {
    execSync(`${openCommand} ${serverUrl}`, { stdio: 'ignore' });
  } catch {
    // Ignore if browser can't be opened
  }

  return { running: true, serverUrl };
};
