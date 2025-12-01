#!/usr/bin/env node
import chalk from 'chalk';
import { Command, CommanderError } from 'commander';
import { readFileSync } from 'fs';
import { join } from 'path';
import { AppCommand } from './commands/app.command';
import { AuthCommand } from './commands/auth.command';
import { ConfigService } from './services/config.service';

const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../../package.json'), 'utf-8'),
);

const program = new Command();

program
  .name('twenty')
  .description('CLI for Twenty application development')
  .version(packageJson.version);

program.option(
  '--workspace <name>',
  'Use a specific workspace configuration',
  'default',
);

program.hook('preAction', (thisCommand) => {
  const opts = (thisCommand as any).optsWithGlobals
    ? (thisCommand as any).optsWithGlobals()
    : thisCommand.opts();
  const workspace = opts.workspace;
  ConfigService.setActiveWorkspace(workspace);
  console.log(
    chalk.gray(`👩‍💻 Workspace - ${ConfigService.getActiveWorkspace()}`),
  );
});

program.addCommand(new AuthCommand().getCommand());
program.addCommand(new AppCommand().getCommand());

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
