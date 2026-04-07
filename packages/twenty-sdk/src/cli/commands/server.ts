import { serverStart } from '@/cli/operations/server-start';
import {
  CONTAINER_NAME,
  containerExists,
  DEFAULT_PORT,
  DEFAULT_TEST_PORT,
  getContainerPort,
  isContainerRunning,
  TEST_CONTAINER_NAME,
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
    .option('-p, --port <port>', 'HTTP port')
    .option('--test', 'Start a separate test instance (port 2021)')
    .action(async (options: { port?: string; test?: boolean }) => {
      const defaultPort = options.test ? DEFAULT_TEST_PORT : DEFAULT_PORT;
      const port = options.port ? parseInt(options.port, 10) : defaultPort;

      if (isNaN(port) || port < 1 || port > 65535) {
        console.error(chalk.red('Invalid port number.'));
        process.exit(1);
      }

      const result = await serverStart({
        port,
        test: options.test,
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
    .option('--test', 'Stop the test instance')
    .action((options: { test?: boolean }) => {
      const containerName = options.test ? TEST_CONTAINER_NAME : CONTAINER_NAME;

      if (!containerExists(containerName)) {
        console.log(chalk.yellow('No Twenty server container found.'));

        return;
      }

      execSync(`docker stop ${containerName}`, { stdio: 'ignore' });
      console.log(chalk.green('Twenty server stopped.'));
    });

  server
    .command('logs')
    .description('Stream Twenty server logs')
    .option('-n, --lines <lines>', 'Number of lines to show', '50')
    .option('--test', 'Show logs for the test instance')
    .action((options: { lines: string; test?: boolean }) => {
      const containerName = options.test ? TEST_CONTAINER_NAME : CONTAINER_NAME;

      if (!containerExists(containerName)) {
        console.log(chalk.yellow('No Twenty server container found.'));

        return;
      }

      try {
        spawnSync(
          'docker',
          ['logs', '-f', '--tail', options.lines, containerName],
          { stdio: 'inherit' },
        );
      } catch {
        // User hit Ctrl-C
      }
    });

  server
    .command('status')
    .description('Show Twenty server status')
    .option('--test', 'Show status of the test instance')
    .action(async (options: { test?: boolean }) => {
      const containerName = options.test ? TEST_CONTAINER_NAME : CONTAINER_NAME;
      const defaultPort = options.test ? DEFAULT_TEST_PORT : DEFAULT_PORT;

      if (!containerExists(containerName)) {
        console.log(`  Status:  ${chalk.gray('not created')}`);
        console.log(
          chalk.gray(
            `  Run 'yarn twenty server start${options.test ? ' --test' : ''}' to create one.`,
          ),
        );

        return;
      }

      const running = isContainerRunning(containerName);
      const port = running ? getContainerPort(containerName) : defaultPort;
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
    .option('--test', 'Reset the test instance')
    .action((options: { test?: boolean }) => {
      const containerName = options.test ? TEST_CONTAINER_NAME : CONTAINER_NAME;
      const volumeData = options.test
        ? 'twenty-app-dev-test-data'
        : 'twenty-app-dev-data';
      const volumeStorage = options.test
        ? 'twenty-app-dev-test-storage'
        : 'twenty-app-dev-storage';

      if (containerExists(containerName)) {
        execSync(`docker rm -f ${containerName}`, { stdio: 'ignore' });
      }

      try {
        execSync(`docker volume rm ${volumeData} ${volumeStorage}`, {
          stdio: 'ignore',
        });
      } catch {
        // Volumes may not exist
      }

      console.log(chalk.green('Twenty server data reset.'));
      console.log(
        chalk.gray(
          `Run 'yarn twenty server start${options.test ? ' --test' : ''}' to start a fresh instance.`,
        ),
      );
    });
};
