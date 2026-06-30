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

const startAction = async (
  version: string | undefined,
  options: { port?: string; test?: boolean },
) => {
  const defaultPort = options.test ? DEFAULT_TEST_PORT : DEFAULT_PORT;
  const port = options.port ? parseInt(options.port, 10) : defaultPort;

  if (isNaN(port) || port < 1 || port > 65535) {
    console.error(chalk.red('Invalid port number.'));
    process.exit(1);
  }

  const result = await serverStart({
    port,
    test: options.test,
    version,
    onProgress: (message) => console.log(chalk.gray(message)),
  });

  if (!result.success) {
    console.error(chalk.red(result.error.message));
    process.exit(1);
  }
};

const stopAction = (options: { test?: boolean }) => {
  const containerName = options.test ? TEST_CONTAINER_NAME : CONTAINER_NAME;

  if (!containerExists(containerName)) {
    console.log(chalk.yellow('No Twenty server container found.'));

    return;
  }

  execSync(`docker stop ${containerName}`, { stdio: 'ignore' });
  console.log(chalk.green('Twenty server stopped.'));
};

const logsAction = (options: { lines: string; test?: boolean }) => {
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
};

const statusAction = async (options: { test?: boolean }) => {
  const containerName = options.test ? TEST_CONTAINER_NAME : CONTAINER_NAME;
  const defaultPort = options.test ? DEFAULT_TEST_PORT : DEFAULT_PORT;

  if (!containerExists(containerName)) {
    console.log(`  Status:  ${chalk.gray('not created')}`);
    console.log(
      chalk.gray(
        `  Run 'yarn twenty docker:start${options.test ? ' --test' : ''}' to create one.`,
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
};

const resetAction = (options: { test?: boolean }) => {
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
      `Run 'yarn twenty docker:start${options.test ? ' --test' : ''}' to start a fresh instance.`,
    ),
  );
};

const upgradeAction = async (
  version: string | undefined,
  options: { test?: boolean },
) => {
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
        `  Run 'yarn twenty docker:start${options.test ? ' --test' : ''}' to wait for the server to be ready.`,
      ),
    );
  }
};

export const registerServerCommands = (program: Command): void => {
  program
    .command('docker:start [version]')
    .description(
      'Start the local Twenty container (version defaults to the app `engines.twenty` range, then `latest`)',
    )
    .option('-p, --port <port>', 'HTTP port')
    .option('--test', 'Start a separate test instance (port 2021)')
    .action(startAction);

  program
    .command('docker:stop')
    .description('Stop the local Twenty container')
    .option('--test', 'Stop the test instance')
    .action(stopAction);

  program
    .command('docker:logs')
    .description('Stream container logs')
    .option('-n, --lines <lines>', 'Number of lines to show', '50')
    .option('--test', 'Show logs for the test instance')
    .action(logsAction);

  program
    .command('docker:status')
    .description('Show container status')
    .option('--test', 'Show status of the test instance')
    .action(statusAction);

  program
    .command('docker:reset')
    .description('Delete all data and start fresh')
    .option('--test', 'Reset the test instance')
    .action(resetAction);

  program
    .command('docker:upgrade [version]')
    .description('Upgrade the Docker image')
    .option('--test', 'Upgrade the test instance')
    .action(upgradeAction);

  // Deprecated: `server <subcommand>` forwarding to `docker:<subcommand>`
  const server = program
    .command('server', { hidden: true })
    .description(
      'Manage a Twenty server (local instance and server-side actions)',
    );

  const deprecate = (oldCmd: string, newCmd: string) =>
    console.warn(
      chalk.yellow(
        `⚠ \`twenty server ${oldCmd}\` is deprecated. Use \`twenty ${newCmd}\` instead.`,
      ),
    );

  server
    .command('start [version]')
    .option('-p, --port <port>', 'HTTP port')
    .option('--test', 'Start a separate test instance (port 2021)')
    .action(
      async (
        version: string | undefined,
        options: { port?: string; test?: boolean },
      ) => {
        deprecate('start', 'docker:start');
        await startAction(version, options);
      },
    );

  server
    .command('stop')
    .option('--test', 'Stop the test instance')
    .action((options: { test?: boolean }) => {
      deprecate('stop', 'docker:stop');
      stopAction(options);
    });

  server
    .command('logs')
    .option('-n, --lines <lines>', 'Number of lines to show', '50')
    .option('--test', 'Show logs for the test instance')
    .action((options: { lines: string; test?: boolean }) => {
      deprecate('logs', 'docker:logs');
      logsAction(options);
    });

  server
    .command('status')
    .option('--test', 'Show status of the test instance')
    .action(async (options: { test?: boolean }) => {
      deprecate('status', 'docker:status');
      await statusAction(options);
    });

  server
    .command('reset')
    .option('--test', 'Reset the test instance')
    .action((options: { test?: boolean }) => {
      deprecate('reset', 'docker:reset');
      resetAction(options);
    });

  server
    .command('upgrade [version]')
    .option('--test', 'Upgrade the test instance')
    .action(
      async (version: string | undefined, options: { test?: boolean }) => {
        deprecate('upgrade', 'docker:upgrade');
        await upgradeAction(version, options);
      },
    );

  server
    .command('catalog-sync')
    .option('-r, --remote <name>', 'Sync on a specific remote')
    .action(async (options: { remote?: string }) => {
      deprecate('catalog-sync', 'dev:catalog-sync');
      const { CatalogSyncCommand } = await import('../dev/catalog-sync');
      const cmd = new CatalogSyncCommand();
      await cmd.execute({ remote: options.remote });
    });
};
