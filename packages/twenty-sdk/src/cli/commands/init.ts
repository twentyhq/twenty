import { copyBaseApplicationProject } from '@/cli/utilities/init/app-template';
import { install } from '@/cli/utilities/init/install';
import {
  type ExampleOptions,
  type ScaffoldingMode,
} from '@/cli/utilities/init/scaffolding-options';
import { tryGitInit } from '@/cli/utilities/init/try-git-init';
import { convertToLabel } from '@/cli/utilities/entity/entity-label';
import { kebabCase } from '@/cli/utilities/string/kebab-case';
import {
  type LocalInstanceResult,
  setupLocalInstance,
} from '@/cli/utilities/server/setup-local-instance';
import chalk from 'chalk';
import type { Command } from 'commander';
import inquirer from 'inquirer';
import { stat, readdir } from 'node:fs/promises';
import * as path from 'path';
import { isDefined } from 'twenty-shared/utils';
import { execSync } from 'node:child_process';

import sdkPackageJson from '../../../package.json';

const CURRENT_EXECUTION_DIRECTORY = process.env.INIT_CWD || process.cwd();

export type InitOptions = {
  directory?: string;
  mode?: ScaffoldingMode;
  name?: string;
  displayName?: string;
  description?: string;
  skipLocalInstance?: boolean;
  port?: number;
};

const resolveExampleOptions = (mode: ScaffoldingMode): ExampleOptions => {
  if (mode === 'minimal') {
    return {
      includeExampleObject: false,
      includeExampleField: false,
      includeExampleLogicFunction: false,
      includeExampleFrontComponent: false,
      includeExampleView: false,
      includeExampleNavigationMenuItem: false,
      includeExampleSkill: false,
      includeExampleAgent: false,
      includeExampleIntegrationTest: false,
    };
  }

  return {
    includeExampleObject: true,
    includeExampleField: true,
    includeExampleLogicFunction: true,
    includeExampleFrontComponent: true,
    includeExampleView: true,
    includeExampleNavigationMenuItem: true,
    includeExampleSkill: true,
    includeExampleIntegrationTest: true,
    includeExampleAgent: true,
  };
};

const getAppInfos = async (
  options: InitOptions,
): Promise<{
  appName: string;
  appDisplayName: string;
  appDescription: string;
  appDirectory: string;
}> => {
  const { directory } = options;

  const hasName = isDefined(options.name) || isDefined(directory);
  const hasDisplayName = isDefined(options.displayName);
  const hasDescription = isDefined(options.description);

  const { name, displayName, description } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Application name:',
      when: () => !hasName,
      default: 'my-twenty-app',
      validate: (input) => {
        if (input.length === 0) return 'Application name is required';
        return true;
      },
    },
    {
      type: 'input',
      name: 'displayName',
      message: 'Application display name:',
      when: () => !hasDisplayName,
      default: (answers: { name?: string }) => {
        return convertToLabel(answers?.name ?? options.name ?? directory ?? '');
      },
    },
    {
      type: 'input',
      name: 'description',
      message: 'Application description (optional):',
      when: () => !hasDescription,
      default: '',
    },
  ]);

  const appName = (options.name ?? name ?? directory ?? 'my-twenty-app').trim();

  const appDisplayName =
    (options.displayName ?? displayName)?.trim() || convertToLabel(appName);

  const appDescription = (options.description ?? description ?? '').trim();

  const appDirectory = directory
    ? path.join(CURRENT_EXECUTION_DIRECTORY, directory)
    : path.join(CURRENT_EXECUTION_DIRECTORY, kebabCase(appName));

  return { appName, appDisplayName, appDirectory, appDescription };
};

const validateDirectory = async (appDirectory: string): Promise<void> => {
  try {
    const stats = await stat(appDirectory);

    if (stats.isDirectory()) {
      const files = await readdir(appDirectory);

      if (files.length > 0) {
        throw new Error(
          `Directory ${appDirectory} already exists and is not empty`,
        );
      }
    }
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return;
    }

    throw error;
  }
};

const connectToLocal = (appDirectory: string, serverUrl: string): void => {
  try {
    execSync(`yarn twenty remote add ${serverUrl} --as local`, {
      cwd: appDirectory,
      stdio: 'inherit',
    });
  } catch {
    console.log(
      chalk.yellow(
        'Authentication skipped. Run `yarn twenty remote add --local` manually.',
      ),
    );
  }
};

export const executeInit = async (options: InitOptions): Promise<void> => {
  const { appName, appDisplayName, appDirectory, appDescription } =
    await getAppInfos(options);

  try {
    const exampleOptions = resolveExampleOptions(options.mode ?? 'exhaustive');

    await validateDirectory(appDirectory);

    console.log(
      chalk.blue('\n', 'Creating Twenty Application\n'),
      chalk.gray(`- Directory: ${appDirectory}\n`, `- Name: ${appName}\n`),
    );

    await copyBaseApplicationProject({
      appName,
      appDisplayName,
      appDescription,
      appDirectory,
      sdkVersion: sdkPackageJson.version,
      exampleOptions,
    });

    await install(appDirectory);

    await tryGitInit(appDirectory);

    let localResult: LocalInstanceResult = { running: false };

    if (!options.skipLocalInstance) {
      localResult = await setupLocalInstance(appDirectory, options.port);

      if (localResult.running && localResult.serverUrl) {
        connectToLocal(appDirectory, localResult.serverUrl);
      }
    }

    const dirName = appDirectory.split('/').reverse()[0] ?? '';

    console.log(chalk.blue('\nApplication created. Next steps:'));
    console.log(chalk.gray(`- cd ${dirName}`));

    if (!localResult.running) {
      console.log(
        chalk.gray(
          '- yarn twenty remote add --local  # Authenticate with Twenty',
        ),
      );
    }

    console.log(
      chalk.gray('- yarn twenty dev                  # Start dev mode'),
    );
  } catch (error) {
    console.error(
      chalk.red('\nCreate application failed:'),
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
};

export const registerInitCommand = (program: Command): void => {
  program
    .command('init [directory]')
    .description('Create a new Twenty application')
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
    .option('--skip-local-instance', 'Skip the local Twenty instance setup')
    .option(
      '-p, --port <port>',
      'Port of an existing Twenty server (skips Docker setup)',
    )
    .action(
      async (
        directory?: string,
        options?: {
          exhaustive?: boolean;
          minimal?: boolean;
          name?: string;
          displayName?: string;
          description?: string;
          skipLocalInstance?: boolean;
          port?: string;
        },
      ) => {
        const modeFlags = [options?.exhaustive, options?.minimal].filter(
          Boolean,
        );

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

        const mode: ScaffoldingMode = options?.minimal
          ? 'minimal'
          : 'exhaustive';

        const port = options?.port ? parseInt(options.port, 10) : undefined;

        await executeInit({
          directory,
          mode,
          name: options?.name,
          displayName: options?.displayName,
          description: options?.description,
          skipLocalInstance: options?.skipLocalInstance,
          port,
        });
      },
    );
};
