import { join } from 'path';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { SOURCE_FILE_NAME } from 'src/engine/integrations/serverless/drivers/constants/source-file-name';
import { readFileContent } from 'src/engine/integrations/file-storage/utils/read-file-content';
import { compileTypescript } from 'src/engine/integrations/serverless/drivers/utils/compile-typescript';
import { FileStorageService } from 'src/engine/integrations/file-storage/file-storage.service';

export class BaseServerlessDriver {
  getFolderPath(serverlessFunction: ServerlessFunctionEntity) {
    return join(
      FileFolder.ServerlessFunction,
      serverlessFunction.workspaceId,
      serverlessFunction.id,
    );
  }

  async getCompiledCode(
    serverlessFunction: ServerlessFunctionEntity,
    fileStorageService: FileStorageService,
  ) {
    const folderPath = this.getFolderPath(serverlessFunction);
    const fileStream = await fileStorageService.read({
      folderPath,
      filename: SOURCE_FILE_NAME,
    });
    const typescriptCode = await readFileContent(fileStream);

    return compileTypescript(typescriptCode);
  }
}
