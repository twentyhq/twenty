#!/usr/bin/env node
import chalk from 'chalk';
import { Command, CommanderError } from 'commander';
import { CreateAppCommand } from '@/create-app.command';
import packageJson from '../package.json';

const program = new Command(packageJson.name)
  .description('CLI tool to initialize a new Twenty application')
  .version(
    packageJson.version,
    '-v, --version',
    'Output the current version of create-twenty-app.',
  )
  .argument('[directory]')
  .option('--example <name>', 'Initialize from an example')
  .option('-n, --name <name>', 'Application name (skips prompt)')
  .option(
    '-d, --display-name <displayName>',
    'Application display name (skips prompt)',
  )
  .option(
    '--description <description>',
    'Application description (skips prompt)',
  )
  .option(
    '--skip-local-instance',
    'Skip the local Twenty instance setup prompt',
  )
  .option('-y, --yes', 'Auto-confirm prompts (e.g. start existing container)')
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
        yes?: boolean;
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

      await new CreateAppCommand().execute({
        directory,
        example: options?.example,
        name: options?.name,
        displayName: options?.displayName,
        description: options?.description,
        skipLocalInstance: options?.skipLocalInstance,
        yes: options?.yes,
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
