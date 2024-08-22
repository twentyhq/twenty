import { FileStorageService } from 'src/engine/integrations/file-storage/file-storage.service';
import { readFileContent } from 'src/engine/integrations/file-storage/utils/read-file-content';
import { SOURCE_FILE_NAME } from 'src/engine/integrations/serverless/drivers/constants/source-file-name';
import { compileTypescript } from 'src/engine/integrations/serverless/drivers/utils/compile-typescript';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { getServerlessFolder } from 'src/engine/integrations/serverless/utils/serverless-get-folder.utils';

export class BaseServerlessDriver {
  async getCompiledCode(
    serverlessFunction: ServerlessFunctionEntity,
    fileStorageService: FileStorageService,
  ) {
    const folderPath = getServerlessFolder({
      serverlessFunction,
      version: 'draft',
    });
    const fileStream = await fileStorageService.read({
      folderPath,
      filename: SOURCE_FILE_NAME,
    });
    const typescriptCode = await readFileContent(fileStream);

    return compileTypescript(typescriptCode);
  }
}
