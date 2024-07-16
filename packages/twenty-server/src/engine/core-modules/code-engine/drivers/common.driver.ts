import { join } from 'path';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { FunctionMetadataEntity } from 'src/engine/metadata-modules/function-metadata/function-metadata.entity';
import { SOURCE_FILE_NAME } from 'src/engine/core-modules/code-engine/drivers/constants/source-file-name';
import { readFileContent } from 'src/engine/integrations/file-storage/utils/read-file-content';
import { compileTypescript } from 'src/engine/core-modules/code-engine/utils/compile-typescript';
import { FileStorageService } from 'src/engine/integrations/file-storage/file-storage.service';

export class CommonDriver {
  getFolderPath(functionMetadata: FunctionMetadataEntity) {
    return join(
      FileFolder.Function,
      functionMetadata.workspaceId,
      functionMetadata.id,
    );
  }

  async getCompiledCode(
    functionMetadata: FunctionMetadataEntity,
    fileStorageService: FileStorageService,
  ) {
    const folderPath = this.getFolderPath(functionMetadata);
    const fileStream = await fileStorageService.read({
      folderPath,
      filename: SOURCE_FILE_NAME,
    });
    const typescriptCode = await readFileContent(fileStream);

    return compileTypescript(typescriptCode);
  }
}
