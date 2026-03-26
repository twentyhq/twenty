import { isObject } from '@sniptt/guards';
import { FileFolder, type ObjectRecord } from 'twenty-shared/types';

import { type QueryResultGetterHandlerInterface } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-getter-handler.interface';

import { isFileOutputArray } from 'src/engine/api/common/common-args-processors/data-arg-processor/types/file-item.guard';
import { type SignedFileOutput } from 'src/engine/api/common/common-args-processors/data-arg-processor/types/file-item.type';
import { type FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export class TimelineActivityQueryResultGetterHandler
  implements QueryResultGetterHandlerInterface
{
  constructor(private readonly fileUrlService: FileUrlService) {}

  async handle(
    record: ObjectRecord,
    workspaceId: string,
    _flatFieldMetadata: FlatFieldMetadata[],
  ): Promise<ObjectRecord> {
    const properties = record['properties'];

    if (!isObject(properties)) {
      return record;
    }

    const diff = properties['diff'];

    if (!isObject(diff)) {
      return record;
    }

    const updatedDiff: Record<string, unknown> = {};
    let hasChanges = false;

    for (const [fieldName, fieldDiff] of Object.entries(diff)) {
      if (!isObject(fieldDiff)) {
        updatedDiff[fieldName] = fieldDiff;
        continue;
      }

      const updatedFieldDiff: Record<string, unknown> = { ...fieldDiff };

      for (const diffKey of ['before', 'after'] as const) {
        const diffValue = updatedFieldDiff[diffKey];

        if (isFileOutputArray(diffValue)) {
          hasChanges = true;
          const signedFiles: SignedFileOutput[] = diffValue.map((file) => ({
            ...file,
            url: this.fileUrlService.signFileByIdUrl({
              fileId: file.fileId,
              workspaceId,
              fileFolder: FileFolder.FilesField,
            }),
          }));

          updatedFieldDiff[diffKey] = signedFiles;
        }
      }

      updatedDiff[fieldName] = updatedFieldDiff;
    }

    if (!hasChanges) {
      return record;
    }

    return {
      ...record,
      properties: {
        ...properties,
        diff: updatedDiff,
      },
    };
  }
}
