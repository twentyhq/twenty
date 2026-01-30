#!/usr/bin/env node
import { registerCommands } from '@/cli/commands/app-command';
import { ConfigService } from '@/cli/utilities/config/config-service';
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
  'Use a specific workspace configuration (overrides the default set by auth:switch)',
);

program.hook('preAction', async (thisCommand) => {
  const opts = (thisCommand as any).optsWithGlobals
    ? (thisCommand as any).optsWithGlobals()
    : thisCommand.opts();

  // If --workspace is provided, use it; otherwise, read the persisted default
  let workspace = opts.workspace;
  if (!workspace) {
    const configService = new ConfigService();
    workspace = await configService.getDefaultWorkspace();
  }

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
