import chalk from 'chalk';
import * as fs from 'fs-extra';
import inquirer from 'inquirer';
import * as path from 'path';
import { copyBaseApplicationProject } from '../utils/app-template';

export class AppInitCommand {
  async execute(options: { path?: string; name?: string }): Promise<void> {
    try {
      const { name, description } = await this.getAppInfos(options.name);

      const appDir = this.determineAppDirectory(name, options.path);

      await this.validateDirectory(appDir);

      this.logCreationInfo(appDir, name);

      await this.createAppStructure(appDir, name, description);

      this.logSuccess(appDir);
    } catch (error) {
      console.error(
        chalk.red('Initialization failed:'),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  }

  private async getAppInfos(
    providedName?: string,
  ): Promise<{ name: string; description: string }> {
    if (providedName) {
      return { name: providedName, description: '' };
    }

    return inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Application name:',
        validate: (input) => {
          if (input.length === 0) return 'Application name is required';
          if (!/^[a-z0-9-]+$/.test(input))
            return 'Name must contain only lowercase letters, numbers, and hyphens';
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
  }

  private determineAppDirectory(
    appName: string,
    providedPath?: string,
  ): string {
    if (providedPath) {
      return path.resolve(providedPath, appName);
    }

    return path.join(process.cwd(), appName!);
  }

  private async validateDirectory(appDir: string): Promise<void> {
    if (!(await fs.pathExists(appDir))) {
      return;
    }

    const files = await fs.readdir(appDir);
    if (files.length > 0) {
      throw new Error(`Directory ${appDir} already exists and is not empty`);
    }
  }

  private logCreationInfo(appDir: string, appName: string): void {
    console.log(chalk.blue('🎯 Creating Twenty Application'));
    console.log(chalk.gray(`📁 Directory: ${appDir}`));
    console.log(chalk.gray(`📝 Name: ${appName}`));
    console.log('');
  }

  private async createAppStructure(
    appDir: string,
    appName: string,
    description: string,
  ): Promise<void> {
    await fs.ensureDir(appDir);

    await copyBaseApplicationProject({ appName, description, appDir });
  }

  private logSuccess(appDir: string): void {
    console.log(chalk.green('✅ Application created successfully!'));
    console.log('');
    console.log(chalk.blue('Next steps:'));
    console.log(`  cd ${appDir}`);
    console.log('  twenty app dev');
  }
}
