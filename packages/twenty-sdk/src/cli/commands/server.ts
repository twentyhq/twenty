import chalk from 'chalk';
import type { Command } from 'commander';
import { execSync, spawnSync } from 'node:child_process';

const CONTAINER_NAME = 'twenty-app-dev';
const IMAGE = 'twentycrm/twenty-app-dev:latest';
const HEALTH_URL = 'http://localhost:2020/healthz';

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

const isServerHealthy = async (): Promise<boolean> => {
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

export const registerServerCommands = (program: Command): void => {
  const server = program
    .command('server')
    .description('Manage a local Twenty server instance');

  server
    .command('start')
    .description('Start a local Twenty server')
    .option('-p, --port <port>', 'HTTP port', '2020')
    .action(async (options: { port: string }) => {
      if (await isServerHealthy()) {
        console.log(
          chalk.green(
            `Twenty server is already running on localhost:${options.port}.`,
          ),
        );

        return;
      }

      if (isContainerRunning()) {
        console.log(chalk.gray('Container is running but not healthy yet.'));

        return;
      }

      if (containerExists()) {
        console.log(chalk.gray('Starting existing container...'));
        execSync(`docker start ${CONTAINER_NAME}`, { stdio: 'ignore' });
      } else {
        try {
          execSync('docker info', { stdio: 'ignore' });
        } catch {
          console.error(
            chalk.red(
              'Docker is not running. Please start Docker and try again.',
            ),
          );
          process.exit(1);
        }

        console.log(chalk.gray(`Pulling ${IMAGE}...`));

        try {
          execSync(`docker pull ${IMAGE}`, { stdio: 'inherit' });
        } catch {
          console.log(chalk.gray('Pull failed, trying local image...'));
        }

        console.log(chalk.gray('Starting Twenty container...'));
        execSync(
          [
            'docker run -d',
            `--name ${CONTAINER_NAME}`,
            `-p ${options.port}:3000`,
            '-v twenty-app-dev-data:/data/postgres',
            '-v twenty-app-dev-storage:/app/.local-storage',
            IMAGE,
          ].join(' '),
          { stdio: 'inherit' },
        );
      }

      console.log(
        chalk.green(
          `Twenty server starting on http://localhost:${options.port}`,
        ),
      );
      console.log(
        chalk.gray('Run `yarn twenty server logs` to follow startup progress.'),
      );
    });

  server
    .command('stop')
    .description('Stop the local Twenty server')
    .action(() => {
      if (!containerExists()) {
        console.log(chalk.yellow('No Twenty server container found.'));

        return;
      }

      execSync(`docker stop ${CONTAINER_NAME}`, { stdio: 'ignore' });
      console.log(chalk.green('Twenty server stopped.'));
    });

  server
    .command('logs')
    .description('Stream Twenty server logs')
    .option('-n, --lines <lines>', 'Number of lines to show', '50')
    .action((options: { lines: string }) => {
      if (!containerExists()) {
        console.log(chalk.yellow('No Twenty server container found.'));

        return;
      }

      try {
        spawnSync(
          'docker',
          ['logs', '-f', '--tail', options.lines, CONTAINER_NAME],
          { stdio: 'inherit' },
        );
      } catch {
        // User hit Ctrl-C
      }
    });

  server
    .command('status')
    .description('Show Twenty server status')
    .action(async () => {
      if (!containerExists()) {
        console.log(`  Status:  ${chalk.gray('not created')}`);
        console.log(
          chalk.gray("  Run 'yarn twenty server start' to create one."),
        );

        return;
      }

      const running = isContainerRunning();
      const healthy = running ? await isServerHealthy() : false;

      const statusText = healthy
        ? chalk.green('running (healthy)')
        : running
          ? chalk.yellow('running (starting...)')
          : chalk.gray('stopped');

      console.log(`  Status:  ${statusText}`);
      console.log(`  URL:     http://localhost:2020`);

      if (healthy) {
        console.log(chalk.gray('  Login:   tim@apple.dev / tim@apple.dev'));
      }
    });

  server
    .command('reset')
    .description('Delete all data and start fresh')
    .action(() => {
      if (containerExists()) {
        execSync(`docker rm -f ${CONTAINER_NAME}`, { stdio: 'ignore' });
      }

      try {
        execSync(
          'docker volume rm twenty-app-dev-data twenty-app-dev-storage',
          {
            stdio: 'ignore',
          },
        );
      } catch {
        // Volumes may not exist
      }

      console.log(chalk.green('Twenty server data reset.'));
      console.log(
        chalk.gray("Run 'yarn twenty server start' to start a fresh instance."),
      );
    });
};
