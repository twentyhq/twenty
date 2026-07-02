import { formatPath } from '@/cli/utilities/file/file-path';
import chalk from 'chalk';
import type { Command } from 'commander';
import { SyncableEntity } from 'twenty-shared/application';
import { EntityAddCommand } from './add';
import { AppBuildCommand } from './build';
import { AppDevCommand } from './dev';
import { AppDevOnceCommand } from './dev-once';
import { registerDevFunctionCommands } from './function';
import { AppGenerateClientCommand } from './generate-client';
import { AppTranslationsExtractCommand } from './translations-extract';
import { AppTypecheckCommand } from './typecheck';

export const registerDevCommands = (program: Command): void => {
  const buildCommand = new AppBuildCommand();
  const devCommand = new AppDevCommand();
  const devOnceCommand = new AppDevOnceCommand();
  const typecheckCommand = new AppTypecheckCommand();
  const addCommand = new EntityAddCommand();
  const generateClientCommand = new AppGenerateClientCommand();
  const translationsExtractCommand = new AppTranslationsExtractCommand();

  const devAction = async (
    appPath: string | undefined,
    options: {
      once?: boolean;
      verbose?: boolean;
      debug?: boolean;
      debounceMs?: string;
      dryRun?: boolean;
      force?: boolean;
    },
  ) => {
    if (options.dryRun && !options.once) {
      console.warn(
        chalk.yellow(
          '--dry-run only applies with --once. Ignoring it; run `yarn twenty plan` to preview changes.',
        ),
      );
    }

    const verbose = options.verbose || options.debug;

    if (options.once) {
      console.warn(
        chalk.yellow(
          options.dryRun
            ? '⚠ `twenty dev --once --dry-run` is deprecated. Use `twenty plan` instead.'
            : '⚠ `twenty dev --once` is deprecated. Use `twenty apply` instead.',
        ),
      );

      await devOnceCommand.execute({
        appPath: formatPath(appPath),
        verbose,
        apply: !options.dryRun,
        force: options.force,
      });

      return;
    }

    await devCommand.execute({
      appPath: formatPath(appPath),
      verbose,
      debounceMs: options.debounceMs
        ? parseInt(options.debounceMs, 10)
        : undefined,
      force: options.force,
    });
  };

  program
    .command('dev [appPath]')
    .description('Build and sync local changes')
    .option(
      '-o, --once',
      'Build and sync once, then exit (deprecated: use `twenty apply`)',
    )
    .option(
      '--dry-run',
      'Preview the metadata changes without applying them (deprecated: use `twenty plan`)',
    )
    .option(
      '-f, --force',
      'Apply destructive changes (deletes) without confirmation',
    )
    .option('--debounceMs <ms>', 'Debounce in ms (default: 1 000)')
    .option('-v, --verbose', 'Show detailed logs')
    .option('-d, --debug', 'Show detailed logs (alias for --verbose)')
    .action(devAction);

  program
    .command('plan [appPath]')
    .description('Preview metadata changes without applying them')
    .option('-v, --verbose', 'Show detailed logs')
    .action(
      async (appPath: string | undefined, options: { verbose?: boolean }) => {
        await devOnceCommand.execute({
          appPath: formatPath(appPath),
          verbose: options.verbose,
          apply: false,
        });
      },
    );

  program
    .command('apply [appPath]')
    .description('Apply local metadata changes after showing the plan')
    .option(
      '-f, --force',
      'Apply destructive changes (deletes) without confirmation',
    )
    .option('-v, --verbose', 'Show detailed logs')
    .action(
      async (
        appPath: string | undefined,
        options: { force?: boolean; verbose?: boolean },
      ) => {
        await devOnceCommand.execute({
          appPath: formatPath(appPath),
          verbose: options.verbose,
          apply: true,
          force: options.force,
        });
      },
    );

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

  program
    .command('dev:translations-extract [appPath]')
    .description('Extract translatable strings into locales/ catalogs')
    .option(
      '--locale <locale>',
      'Scaffold an empty catalog for a target locale (e.g. fr-FR)',
    )
    .action(async (appPath, options) => {
      await translationsExtractCommand.execute({
        appPath: formatPath(appPath),
        locale: options.locale,
      });
    });

  registerDevFunctionCommands(program);
};
