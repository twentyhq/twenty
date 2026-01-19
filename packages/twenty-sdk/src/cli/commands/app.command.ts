import { formatPath } from '@/cli/utilities/file/utils/file-path';
import chalk from 'chalk';
import type { Command } from 'commander';
import { AppBuildCommand } from './app/app-build';
import { AppDevCommand } from './app/app-dev';
import { AppGenerateCommand } from './app/app-generate';
import { AppLogsCommand } from './app/app-logs';
import { AppSyncCommand } from './app/app-sync';
import { AppUninstallCommand } from './app/app-uninstall';
import { AuthLoginCommand } from './auth/auth-login';
import { AuthLogoutCommand } from './auth/auth-logout';
import { AuthStatusCommand } from './auth/auth-status';
import {
  EntityAddCommand,
  isSyncableEntity,
  SyncableEntity,
} from './entity/entity-add';

export const registerCommands = (program: Command): void => {
  // Auth commands
  const loginCommand = new AuthLoginCommand();
  const logoutCommand = new AuthLogoutCommand();
  const statusCommand = new AuthStatusCommand();

  program
    .command('auth:login')
    .description('Authenticate with Twenty')
    .option('--api-key <key>', 'API key for authentication')
    .option('--api-url <url>', 'Twenty API URL')
    .action(async (options) => {
      await loginCommand.execute(options);
    });

  program
    .command('auth:logout')
    .description('Remove authentication credentials')
    .action(async () => {
      await logoutCommand.execute();
    });

  program
    .command('auth:status')
    .description('Check authentication status')
    .action(async () => {
      await statusCommand.execute();
    });

  // App commands
  const devCommand = new AppDevCommand();
  const syncCommand = new AppSyncCommand();
  const uninstallCommand = new AppUninstallCommand();
  const addCommand = new EntityAddCommand();
  const generateCommand = new AppGenerateCommand();
  const logsCommand = new AppLogsCommand();
  const buildCommand = new AppBuildCommand();

  program
    .command('app:dev [appPath]')
    .description('Start development mode: sync local application changes')
    .option('-d, --debounce <ms>', 'Debounce delay in milliseconds', '1000')
    .action(async (appPath, options) => {
      await devCommand.execute({
        ...options,
        appPath: formatPath(appPath),
      });
    });

  program
    .command('app:build [appPath]')
    .description('Build application for deployment')
    .option('-w, --watch', 'Watch for changes and rebuild')
    .option('-t, --tarball', 'Create a tarball after build')
    .action(async (appPath, options) => {
      try {
        const result = await buildCommand.execute({
          ...options,
          appPath: formatPath(appPath),
        });
        if (!result.success) {
          process.exit(1);
        }
      } catch {
        process.exit(1);
      }
    });

  program
    .command('app:sync [appPath]')
    .description('Sync application to Twenty')
    .action(async (appPath?: string) => {
      try {
        const result = await syncCommand.execute(formatPath(appPath));
        if (!result.success) {
          process.exit(1);
        }
      } catch {
        process.exit(1);
      }
    });

  program
    .command('app:uninstall [appPath]')
    .description('Uninstall application from Twenty')
    .action(async (appPath?: string) => {
      try {
        const result = await uninstallCommand.execute({
          appPath: formatPath(appPath),
          askForConfirmation: true,
        });
        if (!result.success) {
          process.exit(1);
        }
      } catch {
        process.exit(1);
      }
    });

  // Keeping to avoid breaking changes
  program
    .command('app:delete [appPath]', { hidden: true })
    .description('Delete application from Twenty')
    .action(async (appPath?: string) => {
      try {
        const result = await uninstallCommand.execute({
          appPath: formatPath(appPath),
          askForConfirmation: true,
        });
        if (!result.success) {
          process.exit(1);
        }
      } catch {
        process.exit(1);
      }
    });

  program
    .command('app:add [entityType]')
    .option('--path <path>', 'Path in which the entity should be created.')
    .description(
      `Add a new entity to your application (${Object.values(SyncableEntity).join('|')})`,
    )
    .action(async (entityType?: string, options?: { path?: string }) => {
      if (entityType && !isSyncableEntity(entityType)) {
        console.error(
          chalk.red(
            `Invalid entity type "${entityType}". Must be one of: ${Object.values(SyncableEntity).join('|')}`,
          ),
        );
        process.exit(1);
      }
      await addCommand.execute(entityType as SyncableEntity, options?.path);
    });

  program
    .command('app:generate [appPath]')
    .description('Generate Twenty client')
    .action(async (appPath?: string) => {
      await generateCommand.execute(formatPath(appPath));
    });

  program
    .command('app:logs [appPath]')
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
