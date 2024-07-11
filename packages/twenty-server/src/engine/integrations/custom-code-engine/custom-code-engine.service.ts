import { Injectable } from '@nestjs/common';

import { fork } from 'child_process';
import { join } from 'path';
import { tmpdir } from 'os';
import { promises as fs } from 'fs';

import { v4 } from 'uuid';
import ts from 'typescript';

import { FunctionWorkspaceEntity } from 'src/modules/function/stadard-objects/function.workspace-entity';
import { FileStorageService } from 'src/engine/integrations/file-storage/file-storage.service';

@Injectable()
export class CustomCodeEngineService {
  constructor(private readonly fileStorageService: FileStorageService) {}

  compileTypeScript(tsCode: string): string {
    const options: ts.CompilerOptions = {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2017,
      moduleResolution: ts.ModuleResolutionKind.Node10,
      esModuleInterop: true,
      resolveJsonModule: true,
      allowSyntheticDefaultImports: true,
      types: ['node'],
    };

    const result = ts.transpileModule(tsCode, {
      compilerOptions: options,
    });

    return result.outputText;
  }

  async execute(
    functionToExecute: FunctionWorkspaceEntity,
    event: object | undefined = undefined,
    context: object | undefined = undefined,
  ): Promise<object> {
    const fileStream = await this.fileStorageService.read({
      folderPath: '',
      filename: functionToExecute.builtSourcePath,
    });
    const fileContent = await this.fileStorageService.readContent(fileStream);

    const tmpFilePath = join(tmpdir(), `${v4()}.js`);

    const modifiedContent = `
    process.on('message', async (message) => {
      const { event, context } = message;
      const result = await handler(event, context);
      process.send(result);
    });

    ${fileContent}
    `;

    await fs.writeFile(tmpFilePath, modifiedContent);

    return await new Promise((resolve, reject) => {
      const child = fork(tmpFilePath);

      child.on('message', (message: object) => {
        resolve(message);
        child.kill();
        fs.unlink(tmpFilePath);
      });

      child.on('error', (error) => {
        reject(error);
        child.kill();
        fs.unlink(tmpFilePath);
      });

      child.on('exit', (code) => {
        if (code && code !== 0) {
          reject(new Error(`Child process exited with code ${code}`));
          fs.unlink(tmpFilePath);
        }
      });

      child.send({ event, context });
    });
  }
}
