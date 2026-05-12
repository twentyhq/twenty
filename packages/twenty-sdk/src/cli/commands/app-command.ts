import { formatPath } from '@/cli/utilities/file/file-path';
import chalk from 'chalk';
import type { Command } from 'commander';
import { SyncableEntity } from 'twenty-shared/application';
import { EntityAddCommand } from './add';
import { AppBuildCommand } from './build';
import { CatalogSyncCommand } from './catalog-sync';
import { DeployCommand } from './deploy';
import { AppDevCommand } from './dev';
import { LogicFunctionExecuteCommand } from './exec';
import { AppInstallCommand } from './install';
import { LogicFunctionLogsCommand } from './logs';
import { AppPublishCommand } from './publish';
import { registerRemoteCommands } from './remote';
import { registerServerCommands } from './server';
import { AppDevOnceCommand } from './dev-once';
import { AppTypecheckCommand } from './typecheck';
import { AppUninstallCommand } from './uninstall';

export const registerCommands = (program: Command): void => {
  const buildCommand = new AppBuildCommand();
  const devCommand = new AppDevCommand();
  const devOnceCommand = new AppDevOnceCommand();
  const installCommand = new AppInstallCommand();
  const publishCommand = new AppPublishCommand();
  const typecheckCommand = new AppTypecheckCommand();
  const uninstallCommand = new AppUninstallCommand();
  const catalogSyncCommand = new CatalogSyncCommand();
  const deployCommand = new DeployCommand();
  const addCommand = new EntityAddCommand();
  const logsCommand = new LogicFunctionLogsCommand();
  const executeCommand = new LogicFunctionExecuteCommand();

  program
    .command('dev [appPath]')
    .description(
      'Build and sync local application changes (watches by default; use --once for a one-shot sync)',
    )
    .option(
      '-w, --watch',
      'Watch source files and re-sync on every change (default behavior)',
    )
    .option(
      '-o, --once',
      'Build and sync once, then exit (useful for CI, scripts, and pre-commit hooks)',
    )
    .option('-v, --verbose', 'Show detailed logs')
    .option('-d, --debug', 'Show detailed logs (alias for --verbose)')
    .action(async (appPath, options) => {
      if (options.once && options.watch) {
        console.error(
          chalk.red(
            'Error: --once and --watch are mutually exclusive. Watch mode is the default.',
          ),
        );
        process.exit(1);
      }

      const commonOptions = {
        appPath: formatPath(appPath),
        verbose: options.verbose || options.debug,
      };

      if (options.once) {
        await devOnceCommand.execute(commonOptions);
        return;
      }

      await devCommand.execute(commonOptions);
    });

  program
    .command('build [appPath]')
    .description('Build, sync, and generate API client into .twenty/output/')
    .option('--tarball', 'Also pack into a .tgz tarball')
    .action(async (appPath, options) => {
      await buildCommand.execute({
        appPath: formatPath(appPath),
        tarball: options.tarball,
      });
    });

  program
    .command('install [appPath]')
    .description('Install a deployed application on the connected server')
    .option('-r, --remote <name>', 'Install on a specific remote')
    .action(async (appPath, options) => {
      await installCommand.execute({
        appPath: formatPath(appPath),
        remote: options.remote,
      });
    });

  program
    .command('deploy [appPath]')
    .description("Publish a new version to a Twenty server's registry")
    .option('-r, --remote <name>', 'Deploy to a specific remote')
    .action(async (appPath, options) => {
      await deployCommand.execute({
        appPath: formatPath(appPath),
        remote: options.remote,
      });
    });

  program
    .command('publish [appPath]')
    .description('Build and publish to npm')
    .option('--tag <tag>', 'npm dist-tag (e.g. beta, next)')
    .action(async (appPath, options) => {
      await publishCommand.execute({
        appPath: formatPath(appPath),
        tag: options.tag,
      });
    });

  program
    .command('catalog-sync')
    .description(
      '[Deprecated] Moved under server. Use `yarn twenty server catalog-sync`.',
    )
    .option('-r, --remote <name>', 'Sync on a specific remote')
    .action(async (options) => {
      console.warn(
        chalk.yellow(
          '`yarn twenty catalog-sync` is deprecated and will be removed in a future release.\n' +
            'Use `yarn twenty server catalog-sync` instead.\n',
        ),
      );

      await catalogSyncCommand.execute({
        remote: options.remote,
      });
    });

  program
    .command('typecheck [appPath]')
    .description('Run TypeScript type checking on the application')
    .action(async (appPath) => {
      await typecheckCommand.execute({
        appPath: formatPath(appPath),
      });
    });

  program
    .command('uninstall [appPath]')
    .description('Uninstall application from Twenty')
    .option('-y, --yes', 'Skip confirmation prompt')
    .action(async (appPath?: string, options?: { yes?: boolean }) => {
      try {
        const result = await uninstallCommand.execute({
          appPath: formatPath(appPath),
          askForConfirmation: !options?.yes,
        });
        process.exit(result.success ? 0 : 1);
      } catch {
        process.exit(1);
      }
    });

  registerRemoteCommands(program);
  registerServerCommands(program);

  program
    .command('add [entityType]')
    .option('--path <path>', 'Path in which the entity should be created.')
    .description(
      `Add a new entity to your application (${Object.values(SyncableEntity).join('|')})`,
    )
    .action(async (entityType?: string, options?: { path?: string }) => {
      await addCommand.execute(entityType as SyncableEntity, options?.path);
    });

  program
    .command('exec [appPath]')
    .option('--postInstall', 'Execute post-install logic function if defined')
    .option('--preInstall', 'Execute pre-install logic function if defined')
    .option(
      '-p, --payload <payload>',
      'JSON payload to send to the function',
      '{}',
    )
    .option(
      '-u, --functionUniversalIdentifier <functionUniversalIdentifier>',
      'Universal ID of the function to execute',
    )
    .option(
      '-n, --functionName <functionName>',
      'Name of the function to execute',
    )
    .description('Execute a logic function with a JSON payload')
    .action(
      async (
        appPath?: string,
        options?: {
          postInstall?: boolean;
          preInstall?: boolean;
          payload?: string;
          functionUniversalIdentifier?: string;
          functionName?: string;
        },
      ) => {
        if (
          !options?.postInstall &&
          !options?.preInstall &&
          !options?.functionUniversalIdentifier &&
          !options?.functionName
        ) {
          console.error(
            chalk.red(
              'Error: Either --postInstall, --preInstall, --functionName (-n), or --functionUniversalIdentifier (-u) is required.',
            ),
          );
          process.exit(1);
        }
        await executeCommand.execute({
          ...options,
          payload: options?.payload ?? '{}',
          appPath: formatPath(appPath),
        });
      },
    );

  program
    .command('logs [appPath]')
    .option(
      '-u, --functionUniversalIdentifier <functionUniversalIdentifier>',
      'Only show logs for the function with this universal ID',
    )
    .option(
      '-n, --functionName <functionName>',
      'Only show logs for the function with this name',
    )
    .description('Watch application function logs')
    .action(
      async (
        appPath?: string,
        options?: {
          functionUniversalIdentifier?: string;
          functionName?: string;
        },
      ) => {
        await logsCommand.execute({
          ...options,
          appPath: formatPath(appPath),
        });
      },
    );
};
