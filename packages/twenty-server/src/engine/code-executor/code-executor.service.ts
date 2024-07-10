import { Injectable } from '@nestjs/common';

import { Readable } from 'stream';
import { fork } from 'child_process';
import { join } from 'path';
import { tmpdir } from 'os';
import { promises as fs } from 'fs';

import { v4 } from 'uuid';

import { FunctionWorkspaceEntity } from 'src/modules/function/stadard-objects/function.workspace-entity';
import { FileStorageService } from 'src/engine/integrations/file-storage/file-storage.service';

@Injectable()
export class CodeExecutorService {
  constructor(private readonly fileStorageService: FileStorageService) {}

  async streamToString(stream: Readable): Promise<string> {
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('error', (err) => reject(err));
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
  }

  async execute(
    functionToExecute: FunctionWorkspaceEntity,
    event: object | undefined = undefined,
    context: object | undefined = undefined,
  ): Promise<object> {
    const fileContent = await this.streamToString(
      await this.fileStorageService.read({
        folderPath: '',
        filename: functionToExecute.builtSourcePath,
      }),
    );

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
        if (code !== 0) {
          reject(new Error(`Child process exited with code ${code}`));
          fs.unlink(tmpFilePath);
        }
      });

      child.send({ event, context });
    });
  }
}
