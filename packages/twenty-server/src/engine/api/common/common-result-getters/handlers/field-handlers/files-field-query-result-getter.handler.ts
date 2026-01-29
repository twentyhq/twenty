import { isDefined } from 'class-validator';
import { FieldMetadataType, type ObjectRecord } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { type QueryResultGetterHandlerInterface } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-getter-handler.interface';

import {
  type FileItemOutput,
  type SignedFileItemOutput,
} from 'src/engine/api/common/common-args-processors/data-arg-processor/types/file-item.type';
import { type FilesFieldService } from 'src/engine/core-modules/file/files-field/files-field.service';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export class FilesFieldQueryResultGetterHandler
  implements QueryResultGetterHandlerInterface
{
  constructor(private readonly filesFieldService: FilesFieldService) {}

  async handle(
    record: ObjectRecord,
    workspaceId: string,
    flatFieldMetadata: FlatFieldMetadata[],
  ): Promise<ObjectRecord> {
    const filesFields = flatFieldMetadata.filter(
      (field) => field.type === FieldMetadataType.FILES,
    );

    if (filesFields.length === 0) {
      return record;
    }

    for (const field of filesFields) {
      const filesFieldValue = record[field.name] as FileItemOutput[];

      if (!isDefined(filesFieldValue) || !isNonEmptyArray(filesFieldValue)) {
        continue;
      }

      const signedFilesFieldValue: SignedFileItemOutput[] = [];

      for (const file of filesFieldValue) {
        const token = this.filesFieldService.encodeFileToken({
          fileId: file.fileId,
          workspaceId,
        });

        signedFilesFieldValue.push({
          ...file,
          token,
        });
      }

      record[field.name] = signedFilesFieldValue;
    }

    return record;
  }
}
