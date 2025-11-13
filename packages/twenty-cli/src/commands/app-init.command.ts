import chalk from 'chalk';
import * as fs from 'fs-extra';
import inquirer from 'inquirer';
import * as path from 'path';
import { copyBaseApplicationProject } from '../utils/app-template';
import kebabCase from 'lodash.kebabcase';

export class AppInitCommand {
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
        message: 'Application name (eg: my-awesome-app):',
        validate: (input) => {
          if (input.length === 0) return 'Application name is required';
          return true;
        },
      },
      {
        type: 'input',
        name: 'displayName',
        message: 'Display name (eg: My awesome app):',
        default: (answers: any) => {
          return answers.name
            .split('-')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        },
      },
      {
        type: 'input',
        name: 'description',
        message: 'Application description (optional):',
        default: '',
      },
    ]);

    const appName = name.trim();

    const appDisplayName = displayName.trim();

    const appDescription = description.trim();

    const appDirectory = directory
      ? path.join(process.cwd(), kebabCase(directory))
      : path.join(process.cwd(), kebabCase(appName));

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
    console.log(chalk.green('✅ Application created successfully!'));
    console.log('');
    console.log(chalk.blue('Next steps:'));
    console.log(`  cd ${appDirectory}`);
    console.log('  twenty app dev');
  }
}
