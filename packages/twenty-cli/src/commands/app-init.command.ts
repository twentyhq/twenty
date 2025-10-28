import chalk from 'chalk';
import * as fs from 'fs-extra';
import inquirer from 'inquirer';
import * as path from 'path';
import { copyBaseApplicationProject } from '../utils/app-template';
import kebabCase from 'lodash.kebabcase';

export class AppInitCommand {
  async execute(directory?: string): Promise<void> {
    try {
      const { appName, appDirectory, appDescription } =
        await this.getAppInfos(directory);

      await this.validateDirectory(appDirectory);

      this.logCreationInfo({ appDirectory, appName });

      await fs.ensureDir(appDirectory);

      await copyBaseApplicationProject({
        appName,
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
    appDirectory: string;
    appDescription: string;
  }> {
    const { name, description } = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Application name (eg: My awesome application):',
        validate: (input) => {
          if (input.length === 0) return 'Application name is required';
          return true;
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

    const appDescription = description.trim();

    const appDirectory = directory
      ? path.join(process.cwd(), kebabCase(directory))
      : path.join(process.cwd(), kebabCase(appName));

    return { appName, appDirectory, appDescription };
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
