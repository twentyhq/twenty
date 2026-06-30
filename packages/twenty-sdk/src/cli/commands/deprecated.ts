import { formatPath } from '@/cli/utilities/file/file-path';
import chalk from 'chalk';
import type { Command } from 'commander';
import type { SyncableEntity } from 'twenty-shared/application';
import { EntityAddCommand } from './dev/add';
import { AppBuildCommand } from './dev/build';
import { DeployCommand } from './app/deploy';
import { LogicFunctionExecuteCommand } from './dev/exec';
import { AppInstallCommand } from './app/install';
import { LogicFunctionLogsCommand } from './dev/logs';
import { AppTypecheckCommand } from './dev/typecheck';
import { AppUninstallCommand } from './app/uninstall';

const deprecate = (oldCmd: string, newCmd: string) =>
  console.warn(
    chalk.yellow(
      `⚠ \`twenty ${oldCmd}\` is deprecated. Use \`twenty ${newCmd}\` instead.`,
    ),
  );

export const registerDeprecatedCommands = (program: Command): void => {
  const buildCommand = new AppBuildCommand();
  const typecheckCommand = new AppTypecheckCommand();
  const logsCommand = new LogicFunctionLogsCommand();
  const executeCommand = new LogicFunctionExecuteCommand();
  const addCommand = new EntityAddCommand();
  const deployCommand = new DeployCommand();
  const installCommand = new AppInstallCommand();
  const uninstallCommand = new AppUninstallCommand();

  program
    .command('build [appPath]', { hidden: true })
    .option('--tarball', 'Also pack into a .tgz tarball')
    .action(
      async (appPath: string | undefined, options: { tarball?: boolean }) => {
        deprecate('build', 'dev:build');
        await buildCommand.execute({
          appPath: formatPath(appPath),
          tarball: options.tarball,
        });
      },
    );

  program
    .command('typecheck [appPath]', { hidden: true })
    .action(async (appPath: string | undefined) => {
      deprecate('typecheck', 'dev:typecheck');
      await typecheckCommand.execute({
        appPath: formatPath(appPath),
      });
    });

  program
    .command('logs [appPath]', { hidden: true })
    .option(
      '-u, --functionUniversalIdentifier <functionUniversalIdentifier>',
      'Only show logs for the function with this universal ID',
    )
    .option(
      '-n, --functionName <functionName>',
      'Only show logs for the function with this name',
    )
    .action(
      async (
        appPath?: string,
        options?: {
          functionUniversalIdentifier?: string;
          functionName?: string;
        },
      ) => {
        deprecate('logs', 'dev:function:logs');
        await logsCommand.execute({
          ...options,
          appPath: formatPath(appPath),
        });
      },
    );

  program
    .command('exec [appPath]', { hidden: true })
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
        deprecate('exec', 'dev:function:exec');
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
    .command('add [entityType]', { hidden: true })
    .option('--path <path>', 'Path in which the entity should be created.')
    .action(async (entityType?: string, options?: { path?: string }) => {
      deprecate('add', 'dev:add');
      await addCommand.execute(entityType as SyncableEntity, options?.path);
    });

  program
    .command('publish [appPath]', { hidden: true })
    .option('--tag <tag>', 'npm dist-tag (e.g. beta, next)')
    .action(async (appPath: string | undefined, options: { tag?: string }) => {
      deprecate('publish', 'app:publish');
      await deployCommand.execute({
        appPath: formatPath(appPath),
        tag: options.tag,
      });
    });

  program
    .command('deploy [appPath]', { hidden: true })
    .option('-r, --remote <name>', 'Deploy to a specific remote')
    .action(
      async (appPath: string | undefined, options: { remote?: string }) => {
        deprecate('deploy', 'app:publish --private');
        await deployCommand.execute({
          appPath: formatPath(appPath),
          private: true,
          remote: options.remote,
        });
      },
    );

  program
    .command('install [appPath]', { hidden: true })
    .option('-r, --remote <name>', 'Install on a specific remote')
    .action(
      async (appPath: string | undefined, options: { remote?: string }) => {
        deprecate('install', 'app:install');
        await installCommand.execute({
          appPath: formatPath(appPath),
          remote: options.remote,
        });
      },
    );

  program
    .command('uninstall [appPath]', { hidden: true })
    .option('-y, --yes', 'Skip confirmation prompt')
    .action(async (appPath?: string, options?: { yes?: boolean }) => {
      deprecate('uninstall', 'app:uninstall');
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

  program
    .command('catalog-sync', { hidden: true })
    .option('-r, --remote <name>', 'Sync on a specific remote')
    .action(async (options: { remote?: string }) => {
      deprecate('catalog-sync', 'dev:catalog-sync');
      const { CatalogSyncCommand } = await import('./dev/catalog-sync');
      const cmd = new CatalogSyncCommand();
      await cmd.execute({ remote: options.remote });
    });
};
