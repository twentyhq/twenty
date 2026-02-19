#!/usr/bin/env node
import chalk from 'chalk';
import { Command, CommanderError } from 'commander';
import { CreateAppCommand } from '@/create-app.command';
import { type ScaffoldingMode } from '@/types/scaffolding-options';
import packageJson from '../package.json';

const program = new Command(packageJson.name)
  .description('CLI tool to initialize a new Twenty application')
  .version(
    packageJson.version,
    '-v, --version',
    'Output the current version of create-twenty-app.',
  )
  .argument('[directory]')
  .option('-e, --exhaustive', 'Create all example entities (default)')
  .option(
    '-m, --minimal',
    'Create only core entities (application-config and default-role)',
  )
  .option(
    '-i, --interactive',
    'Interactively choose which entity examples to include',
  )
  .helpOption('-h, --help', 'Display this help message.')
  .action(
    async (
      directory?: string,
      options?: {
        exhaustive?: boolean;
        minimal?: boolean;
        interactive?: boolean;
      },
    ) => {
      const modeFlags = [
        options?.exhaustive,
        options?.minimal,
        options?.interactive,
      ].filter(Boolean);

      if (modeFlags.length > 1) {
        console.error(
          chalk.red(
            'Error: --exhaustive, --minimal, and --interactive are mutually exclusive.',
          ),
        );
        process.exit(1);
      }

      if (directory && !/^[a-z0-9-]+$/.test(directory)) {
        console.error(
          chalk.red(
            `Invalid directory "${directory}". Must contain only lowercase letters, numbers, and hyphens`,
          ),
        );
        process.exit(1);
      }

      const mode: ScaffoldingMode = options?.minimal
        ? 'minimal'
        : options?.interactive
          ? 'interactive'
          : 'exhaustive';

      await new CreateAppCommand().execute(directory, mode);
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
