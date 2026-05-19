import { formatPath } from '@/cli/utilities/file/file-path';
import chalk from 'chalk';
import type { Command } from 'commander';
import { SyncableEntity } from 'twenty-shared/application';
import { EntityAddCommand } from './add';
import { AppBuildCommand } from './build';
import { DeployCommand } from './deploy';
import { AppDevCommand } from './dev';
import { LogicFunctionExecuteCommand } from './exec';
import { AppInstallCommand } from './install';
import { LogicFunctionLogsCommand } from './logs';
import { registerRemoteCommands } from './remote';
import { registerServerCommands } from './server';
import { AppDevOnceCommand } from './dev-once';
import { AppTypecheckCommand } from './typecheck';
import { AppUninstallCommand } from './uninstall';

const deprecate = (oldCmd: string, newCmd: string) =>
  console.warn(
    chalk.yellow(
      `⚠ \`twenty ${oldCmd}\` is deprecated. Use \`twenty ${newCmd}\` instead.`,
    ),
  );

export const registerCommands = (program: Command): void => {
  const buildCommand = new AppBuildCommand();
  const devCommand = new AppDevCommand();
  const devOnceCommand = new AppDevOnceCommand();
  const installCommand = new AppInstallCommand();
  const typecheckCommand = new AppTypecheckCommand();
  const uninstallCommand = new AppUninstallCommand();
  const deployCommand = new DeployCommand();
  const addCommand = new EntityAddCommand();
  const logsCommand = new LogicFunctionLogsCommand();
  const executeCommand = new LogicFunctionExecuteCommand();

  // ── Development ──────────────────────────────────────────────────

  const devAction = async (
    appPath: string | undefined,
    options: {
      once?: boolean;
      verbose?: boolean;
      debug?: boolean;
      debounceMs?: string;
    },
  ) => {
    const commonOptions = {
      appPath: formatPath(appPath),
      verbose: options.verbose || options.debug,
      debounceMs: options.debounceMs
        ? parseInt(options.debounceMs, 10)
        : undefined,
    };

    if (options.once) {
      await devOnceCommand.execute(commonOptions);

      return;
    }

    await devCommand.execute(commonOptions);
  };

  program
    .command('dev [appPath]', { isDefault: true })
    .description('Build and sync local changes (default command)')
    .option(
      '-o, --once',
      'Build and sync once, then exit (useful for CI, scripts, and pre-commit hooks)',
    )
    .option('--debounceMs <ms>', 'Debounce in ms (default: 2 000)')
    .option('-v, --verbose', 'Show detailed logs')
    .option('-d, --debug', 'Show detailed logs (alias for --verbose)')
    .action(devAction);

  program
    .command('dev:build [appPath]')
    .description('Build and generate API client')
    .option('--tarball', 'Also pack into a .tgz tarball')
    .action(async (appPath, options) => {
      await buildCommand.execute({
        appPath: formatPath(appPath),
        tarball: options.tarball,
      });
    });

  program
    .command('dev:typecheck [appPath]')
    .description('Run TypeScript type checking')
    .action(async (appPath) => {
      await typecheckCommand.execute({
        appPath: formatPath(appPath),
      });
    });

  program
    .command('dev:fn-logs [appPath]')
    .description('Stream logic function logs')
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
        await logsCommand.execute({
          ...options,
          appPath: formatPath(appPath),
        });
      },
    );

  program
    .command('dev:fn-exec [appPath]')
    .description('Execute a logic function')
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
    .command('dev:add [entityType]')
    .description(
      `Scaffold a new entity (${Object.values(SyncableEntity).join('|')})`,
    )
    .option('--path <path>', 'Path in which the entity should be created.')
    .action(async (entityType?: string, options?: { path?: string }) => {
      await addCommand.execute(entityType as SyncableEntity, options?.path);
    });

  // ── App Lifecycle ────────────────────────────────────────────────

  program
    .command('app:publish [appPath]')
    .description('Build and publish to npm (default) or server registry')
    .option('--private', "Push to a Twenty server's registry instead of npm")
    .option('-r, --remote <name>', 'Publish to a specific remote (with --private)')
    .option('--tag <tag>', 'npm dist-tag (e.g. beta, next)')
    .action(async (appPath, options) => {
      await deployCommand.execute({
        appPath: formatPath(appPath),
        private: options.private,
        remote: options.remote,
        tag: options.tag,
      });
    });

  program
    .command('app:install [appPath]')
    .description('Install a deployed app on the server')
    .option('-r, --remote <name>', 'Install on a specific remote')
    .action(async (appPath, options) => {
      await installCommand.execute({
        appPath: formatPath(appPath),
        remote: options.remote,
      });
    });

  program
    .command('app:uninstall [appPath]')
    .description('Uninstall app from server')
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

  program
    .command('app:catalog-sync')
    .description('Trigger marketplace catalog sync')
    .option('-r, --remote <name>', 'Sync on a specific remote')
    .action(async (options: { remote?: string }) => {
      const { CatalogSyncCommand } = await import('./catalog-sync');
      const cmd = new CatalogSyncCommand();
      await cmd.execute({ remote: options.remote });
    });

  // ── Infrastructure ───────────────────────────────────────────────

  registerRemoteCommands(program);
  registerServerCommands(program);

  // ── Deprecated root commands (hidden, forward to new names) ──────

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
        deprecate('logs', 'dev:fn-logs');
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
        deprecate('exec', 'dev:fn-exec');
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
      deprecate('catalog-sync', 'app:catalog-sync');
      const { CatalogSyncCommand } = await import('./catalog-sync');
      const cmd = new CatalogSyncCommand();
      await cmd.execute({ remote: options.remote });
    });
};
