import { copyBaseApplicationProject } from '@/utils/app-template';
import { convertToLabel } from '@/utils/convert-to-label';
import { install } from '@/utils/install';
import {
  type LocalInstanceResult,
  setupLocalInstance,
} from '@/utils/setup-local-instance';
import { tryGitInit } from '@/utils/try-git-init';
import chalk from 'chalk';
import * as fs from 'fs-extra';
import inquirer from 'inquirer';
import kebabCase from 'lodash.kebabcase';
import { execSync } from 'node:child_process';
import * as path from 'path';

import {
  type ExampleOptions,
  type ScaffoldingMode,
} from '@/types/scaffolding-options';
import { isDefined } from 'twenty-shared/utils';

const CURRENT_EXECUTION_DIRECTORY = process.env.INIT_CWD || process.cwd();

export class CreateAppCommand {
  async execute(
    directory?: string,
    mode: ScaffoldingMode = 'exhaustive',
  ): Promise<void> {
    try {
      const { appName, appDisplayName, appDirectory, appDescription } =
        await this.getAppInfos(directory);

      const exampleOptions = await this.resolveExampleOptions(mode);

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

      const { needsLocalInstance } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'needsLocalInstance',
          message:
            'Do you need a local instance of Twenty? Recommended if you not have one already.',
          default: true,
        },
      ]);

      let localResult: LocalInstanceResult = { running: false };

      if (needsLocalInstance) {
        localResult = await setupLocalInstance();
      }

      if (isDefined(localResult.apiKey)) {
        this.runAuthLogin(appDirectory, localResult.apiKey);
      }

      this.logSuccess(appDirectory, localResult);
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

  private async resolveExampleOptions(
    mode: ScaffoldingMode,
  ): Promise<ExampleOptions> {
    if (mode === 'minimal') {
      return {
        includeExampleObject: false,
        includeExampleField: false,
        includeExampleLogicFunction: false,
        includeExampleFrontComponent: false,
        includeExampleView: false,
        includeExampleNavigationMenuItem: false,
        includeExampleSkill: false,
      };
    }

    if (mode === 'exhaustive') {
      return {
        includeExampleObject: true,
        includeExampleField: true,
        includeExampleLogicFunction: true,
        includeExampleFrontComponent: true,
        includeExampleView: true,
        includeExampleNavigationMenuItem: true,
        includeExampleSkill: true,
      };
    }

    const { selectedExamples } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedExamples',
        message: 'Select which example files to include:',
        choices: [
          {
            name: 'Example object (custom object definition)',
            value: 'object',
            checked: true,
          },
          {
            name: 'Example field (custom field on the example object)',
            value: 'field',
            checked: true,
          },
          {
            name: 'Example logic function (server-side handler)',
            value: 'logicFunction',
            checked: true,
          },
          {
            name: 'Example front component (React UI component)',
            value: 'frontComponent',
            checked: true,
          },
          {
            name: 'Example view (saved view for the example object)',
            value: 'view',
            checked: true,
          },
          {
            name: 'Example navigation menu item (sidebar link)',
            value: 'navigationMenuItem',
            checked: true,
          },
          {
            name: 'Example skill (AI agent skill definition)',
            value: 'skill',
            checked: true,
          },
        ],
      },
    ]);

    const includeField = selectedExamples.includes('field');
    const includeView = selectedExamples.includes('view');
    const includeObject =
      selectedExamples.includes('object') || includeField || includeView;

    if ((includeField || includeView) && !selectedExamples.includes('object')) {
      console.log(
        chalk.yellow(
          'Note: Example object auto-included because example field/view depends on it.',
        ),
      );
    }

    return {
      includeExampleObject: includeObject,
      includeExampleField: includeField,
      includeExampleLogicFunction: selectedExamples.includes('logicFunction'),
      includeExampleFrontComponent: selectedExamples.includes('frontComponent'),
      includeExampleView: includeView,
      includeExampleNavigationMenuItem:
        selectedExamples.includes('navigationMenuItem'),
      includeExampleSkill: selectedExamples.includes('skill'),
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

  private runAuthLogin(appDirectory: string, apiKey: string): void {
    try {
      execSync(
        `yarn twenty auth:login --api-key "${apiKey}" --api-url http://localhost:3000`,
        { cwd: appDirectory, stdio: 'inherit' },
      );
      console.log(chalk.green('✅ Authenticated with local Twenty instance.'));
    } catch {
      console.log(
        chalk.yellow(
          '⚠️  Auto auth:login failed. Run `yarn twenty auth:login` manually.',
        ),
      );
    }
  }

  private logSuccess(
    appDirectory: string,
    localResult: LocalInstanceResult,
  ): void {
    const dirName = appDirectory.split('/').reverse()[0] ?? '';

    console.log(chalk.green('✅ Application created!'));
    console.log('');
    console.log(chalk.blue('Next steps:'));
    console.log(chalk.gray(`  cd ${dirName}`));

    if (localResult.apiKey) {
      console.log(chalk.gray('  yarn twenty app:dev     # Start dev mode'));
    } else if (localResult.running) {
      console.log(
        chalk.gray(
          '  yarn twenty auth:login  # Use the API key from http://localhost:3000',
        ),
      );
      console.log(chalk.gray('  yarn twenty app:dev     # Start dev mode'));
    } else {
      console.log(
        chalk.gray('  yarn twenty auth:login  # Authenticate with Twenty'),
      );
      console.log(chalk.gray('  yarn twenty app:dev     # Start dev mode'));
    }
  }
}
