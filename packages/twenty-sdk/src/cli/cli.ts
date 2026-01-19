#!/usr/bin/env node
import { registerCommands } from '@/cli/commands/app.command';
import { ConfigService } from '@/cli/utilities/config';
import chalk from 'chalk';
import { Command, CommanderError } from 'commander';
import { inspect } from 'util';
import packageJson from '../../package.json';

inspect.defaultOptions.depth = 10;

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

registerCommands(program);

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
