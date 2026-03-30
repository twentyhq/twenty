import { serverStart } from '@/cli/operations/server-start';
import {
  CONTAINER_NAME,
  containerExists,
  DEFAULT_PORT,
  getContainerPort,
  isContainerRunning,
} from '@/cli/utilities/server/docker-container';
import { checkServerHealth } from '@/cli/utilities/server/detect-local-server';
import chalk from 'chalk';
import type { Command } from 'commander';
import { execSync, spawnSync } from 'node:child_process';

export const registerServerCommands = (program: Command): void => {
  const server = program
    .command('server')
    .description('Manage a local Twenty server instance');

  server
    .command('start')
    .description('Start a local Twenty server')
    .option('-p, --port <port>', 'HTTP port', String(DEFAULT_PORT))
    .action(async (options: { port: string }) => {
      const port = parseInt(options.port, 10);

      if (isNaN(port) || port < 1 || port > 65535) {
        console.error(chalk.red('Invalid port number.'));
        process.exit(1);
      }

      const result = await serverStart({
        port,
        onProgress: (message) => console.log(chalk.gray(message)),
      });

      if (!result.success) {
        console.error(chalk.red(result.error.message));
        process.exit(1);
      }
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
