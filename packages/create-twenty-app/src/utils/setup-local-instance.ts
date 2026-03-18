import chalk from 'chalk';
import { type ChildProcess, execSync, spawn, spawnSync } from 'node:child_process';
import { platform } from 'node:os';

const CONTAINER_NAME = 'twenty-dev';
const IMAGE = 'twentycrm/twenty-dev:latest';
const HEALTH_URL = 'http://localhost:2020/healthz';

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

const isTwentyServerRunning = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(HEALTH_URL, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const body = await response.json();

    return body.status === 'ok';
  } catch {
    return false;
  }
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
    // Extract meaningful progress messages from the noisy container logs
    if (line.includes('Waiting for PostgreSQL')) return 'Starting PostgreSQL...';
    if (line.includes('PostgreSQL is ready')) return 'PostgreSQL ready.';
    if (line.includes('Ready to accept connections tcp'))
      return 'Redis ready.';
    if (line.includes('running initial setup'))
      return 'Running initial database setup...';
    if (line.includes('database:migrate:prod'))
      return 'Running database migrations...';
    if (line.includes('cache:flush')) return 'Flushing cache...';
    if (line.includes('command:prod upgrade'))
      return 'Running workspace upgrade...';
    if (line.includes('workspace:seed:dev'))
      return 'Seeding dev workspace...';
    if (line.includes('NestApplication'))
      return 'Starting Twenty server...';

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

const waitForHealthy = async (
  timeoutSeconds: number = 120,
): Promise<boolean> => {
  const startTime = Date.now();
  const timeoutMs = timeoutSeconds * 1000;

  while (Date.now() - startTime < timeoutMs) {
    if (await isTwentyServerRunning()) {
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  return false;
};

export type LocalInstanceResult = {
  running: boolean;
};

export const setupLocalInstance = async (): Promise<LocalInstanceResult> => {
  console.log('');
  console.log(chalk.blue('Setting up local Twenty instance...'));

  if (await isTwentyServerRunning()) {
    console.log(
      chalk.green('Twenty server is already running on localhost:2020.'),
    );

    return { running: true };
  }

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

  // Start or restart the container
  if (isContainerRunning()) {
    console.log(
      chalk.gray('Container exists but server not healthy, restarting...'),
    );
    execSync(`docker restart ${CONTAINER_NAME}`, { stdio: 'ignore' });
  } else {
    // Remove stopped container if it exists
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
          '-v twenty-dev-data:/data/postgres',
          '-v twenty-dev-storage:/app/.local-storage',
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
  const healthy = await waitForHealthy(180);

  logProcess.kill();

  if (!healthy) {
    console.log(
      chalk.yellow(
        'Twenty server did not become healthy in time. Check: docker logs twenty-dev',
      ),
    );

    return { running: false };
  }

  console.log(
    chalk.green('Twenty server is running on http://localhost:2020.'),
  );
  console.log(
    chalk.gray('Workspace ready — login with tim@apple.dev / tim@apple.dev'),
  );

  // Open the browser so the user can log in
  const openCommand =
    platform() === 'darwin'
      ? 'open'
      : platform() === 'win32'
        ? 'start'
        : 'xdg-open';

  try {
    execSync(`${openCommand} http://localhost:2020`, { stdio: 'ignore' });
  } catch {
    // Ignore if browser can't be opened
  }

  return { running: true };
};
