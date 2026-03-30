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
  '-r, --remote <name>',
  'Use a specific remote (overrides the default set by remote switch)',
);

program.hook('preAction', async (thisCommand) => {
  const opts = (thisCommand as any).optsWithGlobals
    ? (thisCommand as any).optsWithGlobals()
    : thisCommand.opts();

  let remote = opts.remote;
  if (!remote) {
    const configService = new ConfigService();
    remote = await configService.getDefaultRemote();
  } else {
    console.log(chalk.gray(`Using remote: ${remote}`));
  }

  ConfigService.setActiveRemote(remote);
});

registerCommands(program);

program.exitOverride();

const isExitPromptError = (error: unknown): boolean =>
  error instanceof Error && error.name === 'ExitPromptError';

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
