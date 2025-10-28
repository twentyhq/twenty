import chalk from 'chalk';
import { Command } from 'commander';
import { ConfigService } from '../services/config.service';
import { TwentyConfig } from '../types/config.types';

export class ConfigCommand {
  private configService = new ConfigService();

  getCommand(): Command {
    const configCommand = new Command('config');
    configCommand.description('Configuration management');

    configCommand
      .command('get [key]')
      .description('Get configuration value(s)')
      .action(async (key) => {
        await this.get(key);
      });

    configCommand
      .command('set <key> <value>')
      .description('Set configuration value')
      .action(async (key, value) => {
        await this.set(key, value);
      });

    configCommand
      .command('unset <key>')
      .description('Remove configuration value')
      .action(async (key) => {
        await this.unset(key);
      });

    configCommand
      .command('list')
      .description('List all configuration values')
      .action(async () => {
        await this.list();
      });

    return configCommand;
  }

  private async get(key: string | undefined): Promise<void> {
    try {
      const config = await this.configService.getConfig();

      if (key) {
        const value = (config as any)[key];
        if (value !== undefined) {
          console.log(value);
        } else {
          console.log(chalk.gray('(not set)'));
        }
      } else {
        this.printConfig('Configuration', config);
      }
    } catch (error) {
      console.error(
        chalk.red('Failed to get configuration:'),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  }

  private async set(key: keyof TwentyConfig, value: string): Promise<void> {
    try {
      const config = await this.configService.getConfig();
      config[key] = value;
      await this.configService.setConfig(config);
      console.log(chalk.green(`✓ Set ${key} in configuration`));
    } catch (error) {
      console.error(
        chalk.red('Failed to set configuration:'),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  }

  private async unset(key: string): Promise<void> {
    try {
      const config = await this.configService.getConfig();
      delete (config as any)[key];
      await this.configService.setConfig(config);
      console.log(chalk.green(`✓ Removed ${key} from configuration`));
    } catch (error) {
      console.error(
        chalk.red('Failed to unset configuration:'),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  }

  private async list(): Promise<void> {
    try {
      const config = await this.configService.getConfig();
      this.printConfig('Configuration', config);
    } catch (error) {
      console.error(
        chalk.red('Failed to list configuration:'),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  }

  private printConfig(title: string, config: Record<string, any>): void {
    console.log(chalk.blue(title + ':'));

    const keys = Object.keys(config);
    if (keys.length === 0) {
      console.log(chalk.gray('  (empty)'));
      return;
    }

    keys.forEach((key) => {
      const value = config[key];
      const displayValue =
        key.toLowerCase().includes('key') && value
          ? '***' + value.slice(-4)
          : value;

      // Show if value is overridden by environment variable
      const envVarName = `TWENTY_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`;
      const isOverridden = process.env[envVarName] !== undefined;
      const suffix = isOverridden ? chalk.gray(' (from env)') : '';

      console.log(`  ${key}: ${displayValue}${suffix}`);
    });

    // Show available environment variables
    console.log(chalk.gray('\nEnvironment variables:'));
    console.log(chalk.gray('  TWENTY_API_URL - Override API URL'));
    console.log(chalk.gray('  TWENTY_API_KEY - Override API key'));
    console.log(chalk.gray('  TWENTY_DEFAULT_APP - Override default app'));
  }
}
