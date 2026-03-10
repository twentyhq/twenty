import { copyBaseApplicationProject } from '@/utils/app-template';
import { convertToLabel } from '@/utils/convert-to-label';
import { install } from '@/utils/install';
import { tryGitInit } from '@/utils/try-git-init';
import chalk from 'chalk';
import * as fs from 'fs-extra';
import inquirer from 'inquirer';
import kebabCase from 'lodash.kebabcase';
import * as path from 'path';

import {
  type ExampleOptions,
  type ScaffoldingMode,
} from '@/types/scaffolding-options';

const CURRENT_EXECUTION_DIRECTORY = process.env.INIT_CWD || process.cwd();

export class CreateAppCommand {
  async execute(
    directory?: string,
    mode: ScaffoldingMode = 'exhaustive',
  ): Promise<void> {
    try {
      const { appName, appDisplayName, appDirectory, appDescription } =
        await this.getAppInfos(directory);

      const exampleOptions = this.resolveExampleOptions(mode);

      await this.validateDirectory(appDirectory);

      this.logCreationInfo({ appDirectory, appName });

      await fs.ensureDir(appDirectory);

      await copyBaseApplicationProject({
        appName,
        appDisplayName,
        appDescription,
        appDirectory,
        exampleOptions,
      });

      await install(appDirectory);

      await tryGitInit(appDirectory);

      this.logSuccess(appDirectory);
    } catch (error) {
      console.error(
        chalk.red('Initialization failed:'),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  }

  private async getAppInfos(directory?: string): Promise<{
    appName: string;
    appDisplayName: string;
    appDescription: string;
    appDirectory: string;
  }> {
    const { name, displayName, description } = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Application name:',
        when: () => !directory,
        default: 'my-awesome-app',
        validate: (input) => {
          if (input.length === 0) return 'Application name is required';
          return true;
        },
      },
      {
        type: 'input',
        name: 'displayName',
        message: 'Application display name:',
        default: (answers: any) => {
          return convertToLabel(answers?.name ?? directory);
        },
      },
      {
        type: 'input',
        name: 'description',
        message: 'Application description (optional):',
        default: '',
      },
    ]);

    const computedName = name ?? directory;

    const appName = computedName.trim();

    const appDisplayName = displayName.trim();

    const appDescription = description.trim();

    const appDirectory = directory
      ? path.join(CURRENT_EXECUTION_DIRECTORY, directory)
      : path.join(CURRENT_EXECUTION_DIRECTORY, kebabCase(appName));

    return { appName, appDisplayName, appDirectory, appDescription };
  }

  private resolveExampleOptions(mode: ScaffoldingMode): ExampleOptions {
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
  }

  private async validateDirectory(appDirectory: string): Promise<void> {
    if (!(await fs.pathExists(appDirectory))) {
      return;
    }

    const files = await fs.readdir(appDirectory);
    if (files.length > 0) {
      throw new Error(
        `Directory ${appDirectory} already exists and is not empty`,
      );
    }
  }

  private logCreationInfo({
    appDirectory,
    appName,
  }: {
    appDirectory: string;
    appName: string;
  }): void {
    console.log(chalk.blue('🎯 Creating Twenty Application'));
    console.log(chalk.gray(`📁 Directory: ${appDirectory}`));
    console.log(chalk.gray(`📝 Name: ${appName}`));
    console.log('');
  }

  private logSuccess(appDirectory: string): void {
    const dirName = appDirectory.split('/').reverse()[0] ?? '';

    console.log(chalk.green('✅ Application created!'));
    console.log('');
    console.log(chalk.blue('Next steps:'));
    console.log(chalk.gray(`  cd ${dirName}`));
    console.log(
      chalk.gray('  yarn twenty auth:login  # Authenticate with Twenty'),
    );
    console.log(chalk.gray('  yarn twenty app:dev     # Start dev mode'));
  }
}
