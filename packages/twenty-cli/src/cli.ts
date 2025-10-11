#!/usr/bin/env node

import chalk from 'chalk';
import { Command, CommanderError } from 'commander';
import { readFileSync } from 'fs';
import { join } from 'path';
import { AppCommand } from './commands/app.command';
import { AuthCommand } from './commands/auth.command';
import { ConfigCommand } from './commands/config.command';

const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8'),
);

const program = new Command();

program
  .name('twenty')
  .description('CLI for Twenty application development')
  .version(packageJson.version);

program.option(
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
  if (error instanceof CommanderError) {
    process.exit(error.exitCode);
  }
  if (error instanceof Error) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}
