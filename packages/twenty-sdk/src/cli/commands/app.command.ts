import chalk from 'chalk';
import { Command } from 'commander';
import {
  AppAddCommand,
  isSyncableEntity,
  SyncableEntity,
} from './app-add.command';
import { AppUninstallCommand } from '@/cli/commands/app-uninstall.command';
import { AppDevCommand } from '@/cli/commands/app-dev.command';
import { AppSyncCommand } from '@/cli/commands/app-sync.command';
import { AppBuildCommand } from '@/cli/commands/app-build.command';
import { AppPackCommand } from '@/cli/commands/app-pack.command';
import { AppInstallCommand } from '@/cli/commands/app-install.command';
import { formatPath } from '@/cli/utils/format-path';
import { AppGenerateCommand } from '@/cli/commands/app-generate.command';
import { AppLogsCommand } from '@/cli/commands/app-logs.command';

export class AppCommand {
  private devCommand = new AppDevCommand();
  private syncCommand = new AppSyncCommand();
  private uninstallCommand = new AppUninstallCommand();
  private addCommand = new AppAddCommand();
  private generateCommand = new AppGenerateCommand();
  private logsCommand = new AppLogsCommand();
  private buildCommand = new AppBuildCommand();
  private packCommand = new AppPackCommand();
  private installCommand = new AppInstallCommand();

  getCommand(): Command {
    const appCommand = new Command('app');
    appCommand.description('Application development commands');

    appCommand
      .command('dev [appPath]')
      .description('Watch and sync local application changes')
      .option('-d, --debounce <ms>', 'Debounce delay in milliseconds', '1000')
      .action(async (appPath, options) => {
        await this.devCommand.execute({
          ...options,
          appPath: formatPath(appPath),
        });
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

    appCommand
      .command('build [appPath]')
      .description('Build application for distribution')
      .option('-o, --output <dir>', 'Output directory (default: .twenty/output)')
      .option('-p, --pack', 'Also create a tarball after building')
      .action(async (appPath?: string, options?: { output?: string; pack?: boolean }) => {
        try {
          const result = await this.buildCommand.execute({
            appPath: formatPath(appPath),
            output: options?.output,
            pack: options?.pack,
          });
          if (!result.success) {
            process.exit(1);
          }
        } catch {
          process.exit(1);
        }
      });

    appCommand
      .command('pack [appPath]')
      .description('Create a tarball from a built application')
      .option('-o, --output <file>', 'Output tarball path')
      .action(async (appPath?: string, options?: { output?: string }) => {
        try {
          const result = await this.packCommand.execute({
            appPath: formatPath(appPath),
            output: options?.output,
          });
          if (!result.success) {
            process.exit(1);
          }
        } catch {
          process.exit(1);
        }
      });

    appCommand
      .command('install <source>')
      .description('Install application from URL or local tarball')
      .option('-f, --force', 'Force reinstall if already exists')
      .action(async (source: string, options?: { force?: boolean }) => {
        try {
          const result = await this.installCommand.execute({
            source,
            force: options?.force,
          });
          if (!result.success) {
            process.exit(1);
          }
        } catch {
          process.exit(1);
        }
      });

    return appCommand;
  }
}
