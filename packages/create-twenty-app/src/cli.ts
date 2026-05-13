#!/usr/bin/env node
import chalk from 'chalk';
import { Command, CommanderError } from 'commander';
import { CreateAppCommand } from '@/create-app.command';
import packageJson from '../package.json';
import { isDefined } from 'twenty-shared/utils';

const program = new Command(packageJson.name)
  .description('CLI tool to initialize a new Twenty application')
  .version(
    packageJson.version,
    '-v, --version',
    'Output the current version of create-twenty-app.',
  )
  .argument('[directory]')
  .option('--example <name>', 'Initialize from an example')
  .option('-n, --name <name>', 'Application name')
  .option('-d, --display-name <displayName>', 'Application display name')
  .option('--description <description>', 'Application description')
  .option(
    '--skip-local-instance',
    'Skip local Docker server setup (use with --workspace-url for remote instances)',
  )
  .option(
    '--workspace-url <apiUrl>',
    'Twenty instance URL for remote authentication',
  )
  .helpOption('-h, --help', 'Display this help message.')
  .action(
    async (
      directory?: string,
      options?: {
        example?: string;
        name?: string;
        displayName?: string;
        description?: string;
        skipLocalInstance?: boolean;
        apiUrl?: string;
      },
    ) => {
      if (directory && !/^[a-z0-9-]+$/.test(directory)) {
        console.error(
          chalk.red(
            `Invalid directory "${directory}". Must contain only lowercase letters, numbers, and hyphens`,
          ),
        );
        process.exit(1);
      }

      if (options?.name !== undefined && options.name.trim().length === 0) {
        console.error(chalk.red('Error: --name cannot be empty.'));
        process.exit(1);
      }

      const skipLocalInstance =
        options?.skipLocalInstance || isDefined(options?.apiUrl);

      await new CreateAppCommand().execute({
        directory,
        example: options?.example,
        name: options?.name,
        displayName: options?.displayName,
        description: options?.description,
        skipLocalInstance,
        apiUrl: options?.apiUrl,
      });
    },
  );

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
