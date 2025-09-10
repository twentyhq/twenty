import chalk from 'chalk';
import * as fs from 'fs-extra';
import inquirer from 'inquirer';
import * as path from 'path';
import {
  createAgentManifest,
  createManifest,
  createReadmeContent,
} from '../utils/app-template';
import { writeJsoncFile } from '../utils/jsonc-parser';

export class AppInitCommand {
  async execute(options: { path?: string; name?: string }): Promise<void> {
    try {
      const appName = await this.getAppName(options.name);
      const appDir = this.determineAppDirectory(options.path, appName);

      await this.validateDirectory(appDir);

      this.logCreationInfo(appDir, appName);

      await this.createAppStructure(appDir, appName);

      this.logSuccess(appDir);
    } catch (error) {
      console.error(
        chalk.red('Initialization failed:'),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  }

  private async getAppName(providedName?: string): Promise<string> {
    if (providedName) {
      return providedName;
    }

    const nameAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'appName',
        message: 'Application name:',
        validate: (input) => {
          if (input.length === 0) return 'Application name is required';
          if (!/^[a-z0-9-]+$/.test(input))
            return 'Name must contain only lowercase letters, numbers, and hyphens';
          return true;
        },
      },
    ]);

    return nameAnswer.appName;
  }

  private determineAppDirectory(
    providedPath?: string,
    appName?: string,
  ): string {
    if (providedPath) {
      return path.resolve(providedPath);
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
  ): Promise<void> {
    await fs.ensureDir(appDir);

    // Create agents directory
    const agentsDir = path.join(appDir, 'agents');
    await fs.ensureDir(agentsDir);

    // Create main manifest with agent references
    const manifest = createManifest(appName);
    const manifestPath = path.join(appDir, 'twenty-app.jsonc');
    await writeJsoncFile(manifestPath, manifest);

    // Create agent manifest file
    const agentManifest = createAgentManifest(appName);
    const agentFileName = `${appName}-agent`;
    const agentPath = path.join(agentsDir, `${agentFileName}.jsonc`);
    await writeJsoncFile(agentPath, agentManifest);

    // Create README
    const readmeContent = createReadmeContent(appName, appDir);
    await fs.writeFile(path.join(appDir, 'README.md'), readmeContent);
  }

  private logSuccess(appDir: string): void {
    console.log(chalk.green('✅ Application created successfully!'));
    console.log('');
    console.log(chalk.blue('Next steps:'));
    console.log(`  cd ${appDir}`);
    console.log('  twenty app dev');
  }
}
