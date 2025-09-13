#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander';
import { AppCommand } from './commands/app.command';
import { AuthCommand } from './commands/auth.command';
import { ConfigCommand } from './commands/config.command';

const program = new Command();

program
  .name('twenty')
  .description('CLI for Twenty application development')
  .version('0.1.0');

program
  .option('-v, --verbose', 'Enable verbose logging')
  .option(
    '--api-url <url>',
    'Twenty API URL',
    process.env.TWENTY_API_URL || 'http://localhost:3000',
  );

program.addCommand(new AuthCommand().getCommand());
program.addCommand(new AppCommand().getCommand());
program.addCommand(new ConfigCommand().getCommand());

program.exitOverride();

try {
  program.parse();
} catch (error) {
  if (error instanceof Error) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}
