#!/usr/bin/env node
import chalk from 'chalk';
import { Command, CommanderError } from 'commander';
import { AppCommand } from '@/cli/commands/app.command';
import { AuthCommand } from '@/cli/commands/auth.command';
import { ConfigService } from '@/cli/services/config.service';
import packageJson from '../../package.json';

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
