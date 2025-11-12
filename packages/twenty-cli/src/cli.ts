#!/usr/bin/env node

import chalk from 'chalk';
import { Command, CommanderError } from 'commander';
import { readFileSync } from 'fs';
import { join } from 'path';
import { AppCommand } from './commands/app.command';
import { AuthCommand } from './commands/auth.command';
import { ConfigCommand } from './commands/config.command';
import { ConfigService } from './services/config.service';

const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8'),
);

const program = new Command();

program
  .name('twenty')
  .description('CLI for Twenty application development')
  .version(packageJson.version);

program.option(
  '--profile <name>',
  'Use a named configuration profile',
  'default',
);

program.hook('preAction', (thisCommand) => {
  const opts = (thisCommand as any).optsWithGlobals
    ? (thisCommand as any).optsWithGlobals()
    : thisCommand.opts();
  const profile = opts.profile;
  ConfigService.setActiveProfile(profile);
  console.log(chalk.gray(`👩‍💻 Profile - ${ConfigService.getActiveProfile()}`));
});

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
