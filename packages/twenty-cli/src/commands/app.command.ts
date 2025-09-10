import { Command } from 'commander';
import { AppDeployCommand } from './app-deploy.command';
import { AppDevCommand } from './app-dev.command';
import { AppInitCommand } from './app-init.command';
import { AppInstallCommand } from './app-install.command';
import { AppListCommand } from './app-list.command';

export class AppCommand {
  private devCommand = new AppDevCommand();
  private deployCommand = new AppDeployCommand();
  private installCommand = new AppInstallCommand();
  private listCommand = new AppListCommand();
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
      .option('--verbose', 'Enable verbose logging')
      .action(async (options) => {
        await this.devCommand.execute(options);
      });

    appCommand
      .command('deploy')
      .description('Deploy application to Twenty')
      .option(
        '-p, --path <path>',
        'Application directory path (auto-detected if not specified)',
      )
      .action(async (options) => {
        await this.deployCommand.execute(options);
      });

    appCommand
      .command('install')
      .description('Install application from source')
      .option(
        '-s, --source <source>',
        'Application source (git URL, local path, or marketplace ID)',
      )
      .option(
        '-t, --type <type>',
        'Source type (git, local, marketplace)',
        'local',
      )
      .action(async (options) => {
        await this.installCommand.execute(options);
      });

    appCommand
      .command('list')
      .description('List installed applications')
      .action(async () => {
        await this.listCommand.execute();
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
