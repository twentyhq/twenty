import { FileFolder, type ObjectRecord } from 'twenty-shared/types';

import { type QueryResultGetterHandlerInterface } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-getter-handler.interface';

import { isFieldHoldingFiles } from 'src/engine/core-modules/file/files-field/utils/is-field-holding-files.util';
import { readFilesValue } from 'src/engine/core-modules/file/files-field/utils/read-files-value.util';
import { writeFilesValue } from 'src/engine/core-modules/file/files-field/utils/write-files-value.util';
import { isFileOutputArray } from 'src/engine/api/common/common-args-processors/data-arg-processor/types/file-item.guard';
import type { SignedFileOutput } from 'src/engine/api/common/common-args-processors/data-arg-processor/types/file-item.type';
import { type FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export class FilesFieldQueryResultGetterHandler implements QueryResultGetterHandlerInterface {
  constructor(private readonly fileUrlService: FileUrlService) {}

  async handle(
    record: ObjectRecord,
    workspaceId: string,
    flatFieldMetadata: FlatFieldMetadata[],
  ): Promise<ObjectRecord> {
    const filesFields = flatFieldMetadata.filter(isFieldHoldingFiles);

    if (filesFields.length === 0) {
      return record;
    }

    for (const field of filesFields) {
      const filesFieldValue = readFilesValue({ record, field });

      if (!isFileOutputArray(filesFieldValue)) {
        continue;
      }

      const signedFilesFieldValue: SignedFileOutput[] = [];

      for (const file of filesFieldValue) {
        const url = await this.fileUrlService.signFileByIdUrl({
          fileId: file.fileId,
          workspaceId,
          fileFolder: FileFolder.FilesField,
        });

        signedFilesFieldValue.push({
          ...file,
          url,
        });
      }

      record[field.name] = writeFilesValue({
        fieldValue: record[field.name],
        field,
        filesValue: signedFilesFieldValue,
      });
    }

    return record;
  }
}
