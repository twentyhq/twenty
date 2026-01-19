import { formatPath } from '@/cli/utils/format-path';
import chalk from 'chalk';
import { Command } from 'commander';
import {
  AppAddCommand,
  isSyncableEntity,
  SyncableEntity,
} from './app/app-add';
import { AppBuildCommand } from './app/app-build';
import { AppGenerateCommand } from './app/app-generate';
import { AppLogsCommand } from './app/app-logs';
import { AppSyncCommand } from './app/app-sync';
import { AppUninstallCommand } from './app/app-uninstall';
import { AppWatchCommand } from './app/app-watch';
import { AuthLoginCommand } from './auth/auth-login';
import { AuthLogoutCommand } from './auth/auth-logout';
import { AuthStatusCommand } from './auth/auth-status';

export class AuthCommand {
  private loginCommand = new AuthLoginCommand();
  private logoutCommand = new AuthLogoutCommand();
  private statusCommand = new AuthStatusCommand();

  getCommand(): Command {
    const authCommand = new Command('auth');
    authCommand.description('Authentication commands');

    authCommand
      .command('login')
      .description('Authenticate with Twenty')
      .option('--api-key <key>', 'API key for authentication')
      .option('--api-url <url>', 'Twenty API URL')
      .action(async (options) => {
        await this.loginCommand.execute(options);
      });

    authCommand
      .command('logout')
      .description('Remove authentication credentials')
      .action(async () => {
        await this.logoutCommand.execute();
      });

    authCommand
      .command('status')
      .description('Check authentication status')
      .action(async () => {
        await this.statusCommand.execute();
      });

    return authCommand;
  }
}

export class AppCommand {
  private watchCommand = new AppWatchCommand();
  private syncCommand = new AppSyncCommand();
  private uninstallCommand = new AppUninstallCommand();
  private addCommand = new AppAddCommand();
  private generateCommand = new AppGenerateCommand();
  private logsCommand = new AppLogsCommand();
  private buildCommand = new AppBuildCommand();

  getCommand(): Command {
    const appCommand = new Command('app');
    appCommand.description('Application development commands');

    appCommand
      .command('dev [appPath]')
      .description('Watch and sync local application changes')
      .option('-d, --debounce <ms>', 'Debounce delay in milliseconds', '1000')
      .action(async (appPath, options) => {
        await this.watchCommand.execute({
          ...options,
          appPath: formatPath(appPath),
        });
      });

    appCommand
      .command('build [appPath]')
      .description('Build application for deployment')
      .option('-w, --watch', 'Watch for changes and rebuild')
      .option('-t, --tarball', 'Create a tarball after build')
      .action(async (appPath, options) => {
        try {
          const result = await this.buildCommand.execute({
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

    appCommand
      .command('sync [appPath]')
      .description('Sync application to Twenty')
      .action(async (appPath?: string) => {
        try {
          const result = await this.syncCommand.execute(formatPath(appPath));
          if (!result.success) {
            process.exit(1);
          }
        } catch {
          process.exit(1);
        }
      });

    appCommand
      .command('uninstall [appPath]')
      .description('Uninstall application from Twenty')
      .action(async (appPath?: string) => {
        try {
          const result = await this.uninstallCommand.execute({
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
    appCommand
      .command('delete [appPath]', { hidden: true })
      .description('Delete application from Twenty')
      .action(async (appPath?: string) => {
        try {
          const result = await this.uninstallCommand.execute({
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

    appCommand
      .command('add [entityType]')
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
        await this.addCommand.execute(
          entityType as SyncableEntity,
          options?.path,
        );
      });

    appCommand
      .command('generate [appPath]')
      .description('Generate Twenty client')
      .action(async (appPath?: string) => {
        await this.generateCommand.execute(formatPath(appPath));
      });

    appCommand
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
          await this.logsCommand.execute({
            ...options,
            appPath: formatPath(appPath),
          });
        },
      );

    return appCommand;
  }
}
