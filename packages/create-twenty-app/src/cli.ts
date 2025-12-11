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
  .helpOption('-h, --help', 'Display this help message.')
  .action(async (directory?: string) => {
    if (directory && !/^[a-z0-9-]+$/.test(directory)) {
      console.error(
        chalk.red(
          `Invalid directory "${directory}". Must contain only lowercase letters, numbers, and hyphens`,
        ),
      );
      process.exit(1);
    }
    await new CreateAppCommand().execute(directory);
  });

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
