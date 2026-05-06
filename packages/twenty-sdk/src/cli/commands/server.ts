import { serverStart } from '@/cli/operations/server-start';
import { serverUpgrade } from '@/cli/operations/server-upgrade';
import {
  CONTAINER_NAME,
  containerExists,
  DEFAULT_PORT,
  DEFAULT_TEST_PORT,
  getContainerEnvVar,
  getContainerPort,
  isContainerRunning,
  TEST_CONTAINER_NAME,
} from '@/cli/utilities/server/docker-container';
import { checkServerHealth } from '@/cli/utilities/server/detect-local-server';
import chalk from 'chalk';
import type { Command } from 'commander';
import { execSync, spawnSync } from 'node:child_process';
import { CatalogSyncCommand } from './catalog-sync';

export const registerServerCommands = (program: Command): void => {
  const server = program
    .command('server')
    .description(
      'Manage a Twenty server (local instance and server-side actions)',
    );

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

      const appVersion = getContainerEnvVar('APP_VERSION', containerName);

      console.log(`  Status:  ${statusText}`);
      console.log(`  URL:     http://localhost:${port}`);

      if (appVersion) {
        console.log(`  Version: ${chalk.gray(appVersion)}`);
      }

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

  server
    .command('upgrade [version]')
    .description('Upgrade the twenty-app-dev Docker image')
    .option('--test', 'Upgrade the test instance')
    .action(
      async (version: string | undefined, options: { test?: boolean }) => {
        const result = await serverUpgrade({
          version: version ?? 'latest',
          test: options.test,
          onProgress: (message) => console.log(chalk.gray(message)),
        });

        if (!result.success) {
          console.error(chalk.red(result.error.message));
          process.exit(1);
        }

        const { data } = result;

        if (!data.imageUpdated) {
          console.log(chalk.green(`  Already up to date (${data.image}).`));

          return;
        }

        console.log(chalk.green(`  Upgraded to: ${data.image}`));

        if (data.containerRecreated) {
          console.log(
            chalk.gray(
              `  Run 'yarn twenty server start${options.test ? ' --test' : ''}' to wait for the server to be ready.`,
            ),
          );
        }
      },
    );

  server
    .command('catalog-sync')
    .description('Trigger a marketplace catalog sync on the server')
    .option('-r, --remote <name>', 'Sync on a specific remote')
    .action(async (options: { remote?: string }) => {
      const command = new CatalogSyncCommand();
      await command.execute({ remote: options.remote });
    });
};
