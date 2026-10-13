#!/usr/bin/env node
import { registerCommands } from '@/cli/commands';
import { ConfigService } from '@/cli/utilities/config/config-service';
import chalk from 'chalk';
import { Command, CommanderError } from 'commander';
import { inspect } from 'util';
import packageJson from '../../package.json';

inspect.defaultOptions.depth = 10;

const program = new Command();

program
  .name('twenty')
  .description('Deprecated CLI bundled with twenty-sdk')
  .version(packageJson.version);

program.option(
  '-r, --remote <name>',
  'Use a specific remote (overrides the default set by remote:use)',
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

console.warn(
  chalk.yellow(
    [
      'Warning: The CLI bundled with twenty-sdk is deprecated. Use the standalone twenty package instead.',
      'Install: npm install -g twenty',
    ].join('\n'),
  ),
);

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
