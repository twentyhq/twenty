import { Logger } from '@nestjs/common';

import { execFile } from 'child_process';
import * as fs from 'fs/promises';
import { resolve } from 'path';
import { promisify } from 'util';

import { Command, CommandRunner, Option } from 'nest-commander';

const execFilePromise = promisify(execFile);

@Command({
  name: 'serverless:add-packages',
  description:
    'Create a new serverless layer version and install packages in it',
})
export class AddPackagesCommand extends CommandRunner {
  private readonly logger = new Logger(AddPackagesCommand.name);

  @Option({
    flags: '-p, --packages <packages>',
    description: 'comma separated packages (eg: axios,uuid@9.0.1)',
    required: true,
  })
  parsePackages(val: string): string[] {
    return val.split(',');
  }

  async run(
    _passedParams: string[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: Record<string, any>,
  ): Promise<void> {
    this.logger.log('---------------------------------------');
    this.logger.warn('This command should be run locally only');
    this.logger.log('');

    const layersFolder = this.getAbsoluteFilePath(
      `src/engine/core-modules/serverless/drivers/layers`,
    );

    const currentVersion = await this.getLastLayerVersion();
    const newVersion = currentVersion + 1;

    const currentVersionFolder = `${layersFolder}/${currentVersion}`;
    const newVersionFolder = `${layersFolder}/${newVersion}`;

    await fs.cp(currentVersionFolder, newVersionFolder, { recursive: true });

    // Install each package
    this.logger.log('Installing packages');
    await this.installPackages(options.packages, newVersionFolder);

    this.logger.log('Cleaning');
    await this.cleanPackageInstallation(newVersionFolder);

    this.logger.log('Updating last layer version');
    await this.updateLastLayerVersion(newVersion);

    this.logger.log('Add changes to git');
    await this.addToGit(layersFolder);

    this.logger.log('');
    this.logger.log(
      `New packages '${options.packages.join("', '")}' installed in new layer version '${newVersion}' `,
    );
    this.logger.log('Please commit your changes');
    this.logger.log('---------------------------------------');
  }

  private getAbsoluteFilePath(path: string) {
    const rootPath = process.cwd();

    return resolve(rootPath, path);
  }

  private async addToGit(folderPath: string) {
    await execFilePromise('git', ['add', folderPath]);
  }

  private async cleanPackageInstallation(folderPath: string) {
    await fs.rm(folderPath + '/node_modules', {
      recursive: true,
      force: true,
    });
    await fs.rm(folderPath + '/.yarn', {
      recursive: true,
      force: true,
    });
  }

  private async installPackages(packages: string[], folderPath: string) {
    if (packages?.length) {
      for (const packageName of packages) {
        this.logger.log(`- adding '${packageName}'...`);
        try {
          await execFilePromise('yarn', ['add', packageName], {
            cwd: folderPath,
          });
        } catch (error) {
          this.logger.error(
            `Failed to install ${packageName}: ${(error as Error).message}`,
          );
        }
      }
    }
  }

  private async getLastLayerVersion() {
    const filePath = this.getAbsoluteFilePath(
      'src/engine/core-modules/serverless/drivers/layers/last-layer-version.ts',
    );

    const content = await fs.readFile(filePath, 'utf8');
    const match = content.match(/export const LAST_LAYER_VERSION = (\d+);/);

    if (!match) {
      throw new Error('LAST_LAYER_VERSION not found');
    }

    return parseInt(match[1], 10);
  }

  private async updateLastLayerVersion(newVersion: number) {
    const filePath = this.getAbsoluteFilePath(
      'src/engine/core-modules/serverless/drivers/layers/last-layer-version.ts',
    );

    await fs.writeFile(
      filePath,
      `export const LAST_LAYER_VERSION = ${newVersion};\n`,
      'utf8',
    );
  }
}
