import { Command } from 'commander';
import { AppSyncCommand } from './app-sync.command';
import { AppDevCommand } from './app-dev.command';
import { AppInitCommand } from './app-init.command';
import {
  AppAddCommand,
  isSyncableEntity,
  SyncableEntity,
} from './app-add.command';
import chalk from 'chalk';

export class AppCommand {
  private devCommand = new AppDevCommand();
  private syncCommand = new AppSyncCommand();
  private initCommand = new AppInitCommand();
  private addCommand = new AppAddCommand();

  getCommand(): Command {
    const appCommand = new Command('app');
    appCommand.description('Application development commands');

    appCommand
      .command('dev')
      .description('Watch and sync local application changes')
      .option('-d, --debounce <ms>', 'Debounce delay in milliseconds', '1000')
      .action(async (options) => {
        await this.devCommand.execute(options);
      });

    appCommand
      .command('sync')
      .description('Sync application to Twenty')
      .action(async () => {
        await this.syncCommand.execute();
      });

    appCommand
      .command('init [directory]')
      .description('Initialize a new Twenty application')
      .action(async (directory?: string) => {
        if (directory && !/^[a-z0-9-]+$/.test(directory)) {
          console.error(
            chalk.red(
              `Invalid directory "${directory}". Must contain only lowercase letters, numbers, and hyphens`,
            ),
          );
          process.exit(1);
        }
        await this.initCommand.execute(directory);
      });

    appCommand
      .command('add [entityType]')
      .description(
        `Add a new entity to your application (${Object.values(SyncableEntity).join('|')})`,
      )
      .action(async (entityType?: string) => {
        if (entityType && !isSyncableEntity(entityType)) {
          console.error(
            chalk.red(
              `Invalid entity type "${entityType}". Must be one of: ${Object.values(SyncableEntity).join('|')}`,
            ),
          );
          process.exit(1);
        }
        await this.addCommand.execute(entityType as SyncableEntity);
      });

    return appCommand;
  }
}
