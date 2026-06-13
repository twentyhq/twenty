import { formatPath } from '@/cli/utilities/file/file-path';
import chalk from 'chalk';
import type { Command } from 'commander';
import { SyncableEntity } from 'twenty-shared/application';
import { EntityAddCommand } from './add';
import { AppBuildCommand } from './build';
import { AppDevCommand } from './dev';
import { AppDevOnceCommand } from './dev-once';
import { AppGenerateClientCommand } from './generate-client';
import { AppTypecheckCommand } from './typecheck';
import { registerDevFunctionCommands } from './function';

export const registerDevCommands = (program: Command): void => {
  const buildCommand = new AppBuildCommand();
  const devCommand = new AppDevCommand();
  const devOnceCommand = new AppDevOnceCommand();
  const typecheckCommand = new AppTypecheckCommand();
  const addCommand = new EntityAddCommand();
  const generateClientCommand = new AppGenerateClientCommand();

  const devAction = async (
    appPath: string | undefined,
    options: {
      once?: boolean;
      verbose?: boolean;
      debug?: boolean;
      debounceMs?: string;
      dryRun?: boolean;
    },
  ) => {
    if (options.dryRun && !options.once) {
      console.warn(
        chalk.yellow(
          '--dry-run only applies with --once. Ignoring it; run `yarn twenty dev --once --dry-run` to preview changes.',
        ),
      );
    }

    const commonOptions = {
      appPath: formatPath(appPath),
      verbose: options.verbose || options.debug,
      debounceMs: options.debounceMs
        ? parseInt(options.debounceMs, 10)
        : undefined,
    };

    if (options.once) {
      await devOnceCommand.execute({
        ...commonOptions,
        dryRun: options.dryRun,
      });

      return;
    }

    await devCommand.execute(commonOptions);
  };

  program
    .command('dev [appPath]')
    .description('Build and sync local changes')
    .option(
      '-o, --once',
      'Build and sync once, then exit (useful for CI, scripts, and pre-commit hooks)',
    )
    .option(
      '--dry-run',
      'Preview the metadata changes without applying them (requires --once)',
    )
    .option('--debounceMs <ms>', 'Debounce in ms (default: 1 000)')
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
    .command('dev:add [entityType]')
    .description(
      `Scaffold a new entity (${Object.values(SyncableEntity).join('|')})`,
    )
    .option('--path <path>', 'Path in which the entity should be created.')
    .action(async (entityType?: string, options?: { path?: string }) => {
      await addCommand.execute(entityType as SyncableEntity, options?.path);
    });

  program
    .command('dev:catalog-sync')
    .description('Trigger marketplace catalog sync')
    .option('-r, --remote <name>', 'Sync on a specific remote')
    .action(async (options: { remote?: string }) => {
      const { CatalogSyncCommand } = await import('./catalog-sync');
      const cmd = new CatalogSyncCommand();
      await cmd.execute({ remote: options.remote });
    });

  program
    .command('dev:generate-client [appPath]')
    .description(
      'Generate the typed API client from the active remote (no app definition required)',
    )
    .action(async (appPath) => {
      await generateClientCommand.execute({
        appPath: formatPath(appPath),
      });
    });

  registerDevFunctionCommands(program);
};
