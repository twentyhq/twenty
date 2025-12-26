import chalk from 'chalk';
import * as fs from 'fs-extra';
import inquirer from 'inquirer';
import * as path from 'path';
import { copyBaseApplicationProject } from '@/utils/app-template';
import kebabCase from 'lodash.kebabcase';
import { convertToLabel } from '@/utils/convert-to-label';
import { tryGitInit } from '@/utils/try-git-init';
import { install } from '@/utils/install';

const CURRENT_EXECUTION_DIRECTORY = process.env.INIT_CWD || process.cwd();

export class CreateAppCommand {
  async execute(directory?: string): Promise<void> {
    try {
      const { appName, appDisplayName, appDirectory, appDescription } =
        await this.getAppInfos(directory);

      await this.validateDirectory(appDirectory);

      this.logCreationInfo({ appDirectory, appName });

      await fs.ensureDir(appDirectory);

      await copyBaseApplicationProject({
        appName,
        appDisplayName,
        appDescription,
        appDirectory,
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
    console.log(chalk.green('✅ Application created!'));
    console.log('');
    console.log(chalk.blue('Next steps:'));
    console.log(`cd ${appDirectory.split('/').reverse()[0] ?? ''}`);
    console.log('yarn auth');
  }
}
