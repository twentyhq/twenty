import { ConfigService } from '@/cli/utilities/config/config-service';
import { checkServerHealth } from '@/cli/utilities/server/detect-local-server';
import chalk from 'chalk';
import type { Command } from 'commander';
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
    console.error(
      chalk.red('Docker is not running. Please start Docker and try again.'),
    );

    return false;
  }
};

const validatePort = (value: string): number => {
  const port = parseInt(value, 10);

  if (isNaN(port) || port < 1 || port > 65535) {
    console.error(chalk.red('Invalid port number.'));
    process.exit(1);
  }

  return port;
};

export const registerServerCommands = (program: Command): void => {
  const server = program
    .command('server')
    .description('Manage a local Twenty server instance');

  server
    .command('start')
    .description('Start a local Twenty server')
    .option('-p, --port <port>', 'HTTP port', String(DEFAULT_PORT))
    .action(async (options: { port: string }) => {
      let port = validatePort(options.port);

      if (await checkServerHealth(port)) {
        const localUrl = `http://localhost:${port}`;
        const configService = new ConfigService();

        ConfigService.setActiveRemote('local');
        await configService.setConfig({ apiUrl: localUrl });

        console.log(
          chalk.green(`Twenty server is already running on localhost:${port}.`),
        );

        return;
      }

      if (!checkDockerRunning()) {
        process.exit(1);
      }

      if (isContainerRunning()) {
        console.log(chalk.gray('Container is running but not healthy yet.'));

        return;
      }

      if (containerExists()) {
        const existingPort = getContainerPort();

        if (existingPort !== port) {
          console.log(
            chalk.yellow(
              `Existing container uses port ${existingPort}. Run 'yarn twenty server reset' first to change ports.`,
            ),
          );
        }

        port = existingPort;

        console.log(chalk.gray('Starting existing container...'));
        execSync(`docker start ${CONTAINER_NAME}`, { stdio: 'ignore' });
      } else {
        console.log(chalk.gray('Starting Twenty container...'));

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
          console.error(chalk.red('\nFailed to start Twenty container.'));
          process.exit(runResult.status ?? 1);
        }
      }

      const localUrl = `http://localhost:${port}`;
      const configService = new ConfigService();

      ConfigService.setActiveRemote('local');
      await configService.setConfig({ apiUrl: localUrl });

      console.log(chalk.green(`\nLocal remote configured → ${localUrl}`));
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
      const port = running ? getContainerPort() : DEFAULT_PORT;
      const healthy = running ? await checkServerHealth(port) : false;

      const statusText = healthy
        ? chalk.green('running (healthy)')
        : running
          ? chalk.yellow('running (starting...)')
          : chalk.gray('stopped');

      console.log(`  Status:  ${statusText}`);
      console.log(`  URL:     http://localhost:${port}`);

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
