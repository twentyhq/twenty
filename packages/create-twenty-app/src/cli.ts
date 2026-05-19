#!/usr/bin/env node
import chalk from 'chalk';
import { Command, CommanderError } from 'commander';
import {
  type AuthenticationMethod,
  CreateAppCommand,
} from '@/create-app.command';
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
  .option('-n, --name <name>', 'Application name')
  .option('-d, --display-name <displayName>', 'Application display name')
  .option('--description <description>', 'Application description')
  .option(
    '--api-url <apiUrl>',
    'Twenty instance URL (default: http://localhost:2020)',
  )
  .option(
    '--authentication-method <method>',
    'Authentication method: oauth or apiKey (default: apiKey for local, oauth for remote)',
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
        apiUrl?: string;
        authenticationMethod?: AuthenticationMethod;
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

      if (
        options?.authenticationMethod &&
        !['oauth', 'apiKey'].includes(options.authenticationMethod)
      ) {
        console.error(
          chalk.red(
            'Error: --authentication-method must be "oauth" or "apiKey".',
          ),
        );
        process.exit(1);
      }

      await new CreateAppCommand().execute({
        directory,
        example: options?.example,
        name: options?.name,
        displayName: options?.displayName,
        description: options?.description,
        apiUrl: options?.apiUrl,
        authenticationMethod: options?.authenticationMethod,
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
