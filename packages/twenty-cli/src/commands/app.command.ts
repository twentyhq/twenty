import { Command } from 'commander';
import { AppSyncCommand } from './app-sync.command';
import { AppDevCommand } from './app-dev.command';
import { AppInitCommand } from './app-init.command';

export class AppCommand {
  private devCommand = new AppDevCommand();
  private syncCommand = new AppSyncCommand();
  private initCommand = new AppInitCommand();

  getCommand(): Command {
    const appCommand = new Command('app');
    appCommand.description('Application development commands');

    appCommand
      .command('dev')
      .description('Watch and sync local application changes')
      .option(
        '-p, --path <path>',
        'Application directory path (auto-detected if not specified)',
      )
      .option('-d, --debounce <ms>', 'Debounce delay in milliseconds', '1000')
      .action(async (options) => {
        await this.devCommand.execute(options);
      });

    appCommand
      .command('sync')
      .description('Sync application to Twenty')
      .option(
        '-p, --path <path>',
        'Application directory path (auto-detected if not specified)',
      )
      .action(async (options) => {
        await this.syncCommand.execute(options);
      });

    appCommand
      .command('init')
      .description('Initialize a new Twenty application')
      .option('-p, --path <path>', 'Directory to create the application in')
      .option('-n, --name <name>', 'Application name')
      .action(async (options) => {
        await this.initCommand.execute(options);
      });

    return appCommand;
  }
}
