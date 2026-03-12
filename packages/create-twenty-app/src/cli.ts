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
  .option('-n, --name <name>', 'Application name (skips prompt)')
  .option(
    '-d, --display-name <displayName>',
    'Application display name (skips prompt)',
  )
  .option(
    '--description <description>',
    'Application description (skips prompt)',
  )
  .helpOption('-h, --help', 'Display this help message.')
  .action(
    async (
      directory?: string,
      options?: {
        exhaustive?: boolean;
        minimal?: boolean;
        name?: string;
        displayName?: string;
        description?: string;
      },
    ) => {
      const modeFlags = [options?.exhaustive, options?.minimal].filter(Boolean);

      if (modeFlags.length > 1) {
        console.error(
          chalk.red(
            'Error: --exhaustive and --minimal are mutually exclusive.',
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

      if (options?.name !== undefined && options.name.trim().length === 0) {
        console.error(chalk.red('Error: --name cannot be empty.'));
        process.exit(1);
      }

      const mode: ScaffoldingMode = options?.minimal ? 'minimal' : 'exhaustive';

      await new CreateAppCommand().execute({
        directory,
        mode,
        name: options?.name,
        displayName: options?.displayName,
        description: options?.description,
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
