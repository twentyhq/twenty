import { exec, fork } from 'child_process';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { promisify } from 'util';

import { v4 } from 'uuid';

import { FileStorageExceptionCode } from 'src/engine/integrations/file-storage/interfaces/file-storage-exception';
import {
  ServerlessDriver,
  ServerlessExecuteError,
  ServerlessExecuteResult,
} from 'src/engine/integrations/serverless/drivers/interfaces/serverless-driver.interface';
import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { FileStorageService } from 'src/engine/integrations/file-storage/file-storage.service';
import { readFileContent } from 'src/engine/integrations/file-storage/utils/read-file-content';
import { BaseServerlessDriver } from 'src/engine/integrations/serverless/drivers/base-serverless.driver';
import { BUILD_FILE_NAME } from 'src/engine/integrations/serverless/drivers/constants/build-file-name';
import { getServerlessFolder } from 'src/engine/integrations/serverless/utils/serverless-get-folder.utils';
import { ServerlessFunctionExecutionStatus } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function-execution-result.dto';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import {
  ServerlessFunctionException,
  ServerlessFunctionExceptionCode,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.exception';
import { serverlessFunctionCreateHash } from 'src/engine/metadata-modules/serverless-function/utils/serverless-function-create-hash.utils';
import { BuildDirectoryManager } from 'src/engine/integrations/serverless/drivers/utils/build-directory-manager';
import { createZipFile } from 'src/engine/integrations/serverless/drivers/utils/create-zip-file';
import { get_last_layer_dependencies } from 'src/engine/integrations/serverless/drivers/utils/get_last_layer_dependencies';

import { unzipFile } from './utils/unzip-file';

export interface LocalDriverOptions {
  fileStorageService: FileStorageService;
}

const execPromise = promisify(exec);

export class LocalDriver
  extends BaseServerlessDriver
  implements ServerlessDriver
{
  private readonly fileStorageService: FileStorageService;

  constructor(options: LocalDriverOptions) {
    super();
    this.fileStorageService = options.fileStorageService;
  }

  private async getLastCommonNodeModulesInfo() {
    const lastVersion = 1;

    try {
      const packageJsonStream = await this.fileStorageService.read({
        folderPath: join(
          FileFolder.Shared,
          FileFolder.ServerlessFunctionLayers,
          `${lastVersion}`,
        ),
        filename: 'package.json',
      });
      const packageJson = await readFileContent(packageJsonStream);
      const yarnLockStream = await this.fileStorageService.read({
        folderPath: join(
          FileFolder.Shared,
          FileFolder.ServerlessFunctionLayers,
          `${lastVersion}`,
        ),
        filename: 'yarn.lock',
      });
      const yarnLock = await readFileContent(yarnLockStream);

      return {
        lastCommonNodeModulesHash: serverlessFunctionCreateHash(
          packageJson + yarnLock,
        ),
        lastVersion,
      };
    } catch (error) {
      if (error.code === FileStorageExceptionCode.FILE_NOT_FOUND) {
        return {
          lastCommonNodeModulesHash: undefined,
          lastVersion: 0,
        };
      } else {
        throw error;
      }
    }
  }

  private async buildCommonNodeModules(): Promise<number> {
    const { packageJson, yarnLock } = await get_last_layer_dependencies();
    const dependencyHash = serverlessFunctionCreateHash(
      JSON.stringify(packageJson) + yarnLock,
    );
    const { lastCommonNodeModulesHash, lastVersion } =
      await this.getLastCommonNodeModulesInfo();

    if (dependencyHash === lastCommonNodeModulesHash) {
      return lastVersion;
    }

    const buildDirectoryManager = new BuildDirectoryManager();
    const { sourceTemporaryDir, lambdaZipPath } =
      await buildDirectoryManager.init();

    const newCommonModulesVersion = lastVersion + 1;

    await fs.writeFile(
      join(sourceTemporaryDir, 'package.json'),
      JSON.stringify(packageJson),
    );
    await fs.writeFile(join(sourceTemporaryDir, 'yarn.lock'), yarnLock);

    await execPromise('yarn', {
      cwd: sourceTemporaryDir,
    });

    await createZipFile(sourceTemporaryDir, lambdaZipPath);

    const zipFile = await fs.readFile(lambdaZipPath);

    const newNodeModulesVersionFolderPath = join(
      tmpdir(),
      'nodeModulesVersions',
      `${newCommonModulesVersion}`,
    );

    await unzipFile(lambdaZipPath, newNodeModulesVersionFolderPath);

    await this.fileStorageService.write({
      file: zipFile,
      name: 'node_modules.zip',
      folder: join(
        FileFolder.Shared,
        FileFolder.ServerlessFunctionLayers,
        `${newCommonModulesVersion}`,
      ),
      mimeType: undefined,
    });

    return newCommonModulesVersion;
  }

  async delete() {}

  async build(serverlessFunction: ServerlessFunctionEntity) {
    const javascriptCode = await this.getCompiledCode(
      serverlessFunction,
      this.fileStorageService,
    );

    const draftFolderPath = getServerlessFolder({
      serverlessFunction,
      version: 'draft',
    });

    let functionExists = true;

    try {
      await this.fileStorageService.read({
        folderPath: draftFolderPath,
        filename: BUILD_FILE_NAME,
      });
    } catch (error) {
      if (error.code === FileStorageExceptionCode.FILE_NOT_FOUND) {
        functionExists = false;
      } else {
        throw error;
      }
    }

    await this.fileStorageService.write({
      file: javascriptCode,
      name: BUILD_FILE_NAME,
      mimeType: undefined,
      folder: draftFolderPath,
    });

    if (1 + 1 === 2 || !functionExists) {
      await this.buildCommonNodeModules();
    }
  }

  async publish(serverlessFunction: ServerlessFunctionEntity) {
    await this.build(serverlessFunction);

    return serverlessFunction.latestVersion
      ? `${parseInt(serverlessFunction.latestVersion, 10) + 1}`
      : '1';
  }

  async execute(
    serverlessFunction: ServerlessFunctionEntity,
    payload: object,
    version: string,
  ): Promise<ServerlessExecuteResult> {
    const startTime = Date.now();
    let fileContent = '';

    try {
      const fileStream = await this.fileStorageService.read({
        folderPath: getServerlessFolder({
          serverlessFunction,
          version,
        }),
        filename: BUILD_FILE_NAME,
      });

      fileContent = await readFileContent(fileStream);
    } catch (error) {
      if (error.code === FileStorageExceptionCode.FILE_NOT_FOUND) {
        throw new ServerlessFunctionException(
          `Function Version '${version}' does not exist`,
          ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND,
        );
      }
      throw error;
    }

    const tmpFolderPath = join(tmpdir(), v4());

    const tmpFilePath = join(tmpFolderPath, 'index.js');
    const nodeModulesVersionFolderPath = join(
      tmpdir(),
      'nodeModulesVersions',
      `1`,
    );

    await fs.symlink(nodeModulesVersionFolderPath, tmpFolderPath, 'dir');

    const modifiedContent = `
    process.on('message', async (message) => {
      const { event, context } = message;
      try {
        const result = await handler(event, context);
        process.send(result);
      } catch (error) {
        process.send({
          errorType: error.name,
          errorMessage: error.message,
          stackTrace: error.stack.split('\\n').filter((line) => line.trim() !== ''),
        });
      }
    });

    ${fileContent}
    `;

    await fs.writeFile(tmpFilePath, modifiedContent);

    return await new Promise((resolve, reject) => {
      const child = fork(tmpFilePath, { silent: true });

      child.on('message', (message: object | ServerlessExecuteError) => {
        const duration = Date.now() - startTime;

        if ('errorType' in message) {
          resolve({
            data: null,
            duration,
            error: message,
            status: ServerlessFunctionExecutionStatus.ERROR,
          });
        } else {
          resolve({
            data: message,
            duration,
            status: ServerlessFunctionExecutionStatus.SUCCESS,
          });
        }
        child.kill();
        fs.unlink(tmpFilePath).catch(console.error);
      });

      child.stderr?.on('data', (data) => {
        const stackTrace = data
          .toString()
          .split('\n')
          .filter((line: string) => line.trim() !== '');
        const errorTrace = stackTrace.filter((line: string) =>
          line.includes('Error: '),
        )?.[0];

        let errorType = 'Unknown';
        let errorMessage = '';

        if (errorTrace) {
          errorType = errorTrace.split(':')[0];
          errorMessage = errorTrace.split(': ')[1];
        }
        const duration = Date.now() - startTime;

        resolve({
          data: null,
          duration,
          status: ServerlessFunctionExecutionStatus.ERROR,
          error: {
            errorType,
            errorMessage,
            stackTrace: stackTrace,
          },
        });
        child.kill();
        fs.unlink(tmpFilePath).catch(console.error);
      });

      child.on('error', (error) => {
        reject(error);
        child.kill();
        fs.unlink(tmpFilePath).catch(console.error);
      });

      child.on('exit', (code) => {
        if (code && code !== 0) {
          reject(new Error(`Child process exited with code ${code}`));
          fs.unlink(tmpFilePath).catch(console.error);
        }
      });

      child.send({ event: payload });
    });
  }
}
